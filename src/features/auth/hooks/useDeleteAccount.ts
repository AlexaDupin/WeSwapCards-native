import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth, useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

import { deleteAccount } from '@/src/features/auth/api/userApi';
import { useNotifications } from '@/src/features/notifications/NotificationsProvider';

// Owns the account-deletion flow so the UI stays presentational:
// delete server-side -> drop local state -> sign out -> navigate.
//
// Confirmation lives in DeleteAccountDialog rather than here: it needs an
// acknowledgement tick box, which Alert.alert cannot render. Alert is still
// used below for the failure case, where a plain message is enough.
export function useDeleteAccount() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { clearLocal } = useNotifications();
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);

  const performDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('missing_auth_token');

      await deleteAccount({ token });

      // Account is gone server-side (Clerk identity + cascaded data); drop
      // locally persisted notification state, end the session, and return to
      // the entry screen.
      await clearLocal();
      await signOut().catch(() => {});
      router.replace('/');
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
      Alert.alert(
        'Could not delete account',
        'Something went wrong. Please check your connection and try again.',
      );
    } finally {
      setDeleting(false);
    }
  }, [getToken, clearLocal, signOut, router]);

  return { deleting, performDelete };
}
