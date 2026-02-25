import { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';

import PageLoader from '@/src/components/PageLoader';
import { axiosInstance } from '@/src/lib/axiosInstance';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';

export default function RegisterUserScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { setExplorer } = useExplorer();

  const [checkingUser, setCheckingUser] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /**
   -------------------------------------------------
   STEP 1 — Check if explorer already exists
   -------------------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    async function checkExplorer() {
      if (!isLoaded || !user?.id) return;

      try {
        const token = await getToken();
        if (!token) return;

        const resp = await axiosInstance.post(
          '/login/user',
          { userUID: user.id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const explorer = resp.data;

        // Explorer already exists → skip this screen
        if (!cancelled && explorer?.id) {
          setExplorer({
            explorerId: explorer.id,
            explorerName: explorer.name ?? null,
          });

          router.replace('/(tabs)/cards');
        }
      } catch {
        // Ignore → user likely not created yet
      } finally {
        if (!cancelled) setCheckingUser(false);
      }
    }

    checkExplorer();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.id]);

  /**
   -------------------------------------------------
   STEP 2 — Create explorer
   -------------------------------------------------
   */
  const handleCreateUser = useCallback(async () => {
    setError('');

    const trimmed = username.trim();

    if (!trimmed) {
      setError('Please choose a username.');
      return;
    }

    if (!user?.id) {
      setError('User session missing. Please sign in again.');
      return;
    }

    setSubmitting(true);

    try {
      const token = await getToken();

      await axiosInstance.post(
        '/register/user',
        {
          userUID: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress ?? '',
          sanitizedUsername: trimmed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      /**
       Fetch explorer again to get the ID
       (safer than trusting response shape)
       */
      const loginResp = await axiosInstance.post(
        '/login/user',
        { userUID: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const explorer = loginResp.data;

      if (!explorer?.id) {
        setError('Account created but failed to load profile.');
        return;
      }

      setExplorer({
        explorerId: explorer.id,
        explorerName: explorer.name ?? null,
      });

      router.replace('/(tabs)/cards');
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || 'Registration failed.';

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [username, user?.id]);

  /**
   -------------------------------------------------
   LOADING STATE
   -------------------------------------------------
   */
  if (checkingUser) {
    return <PageLoader />;
  }

  /**
   -------------------------------------------------
   UI
   -------------------------------------------------
   */
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          marginBottom: 20,
        }}
      >
        Choose a username
      </Text>

      {error ? (
        <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
      ) : null}

      <TextInput
        placeholder="Letters, numbers, underscores"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 14,
          marginBottom: 12,
        }}
      />

      <TouchableOpacity
        onPress={handleCreateUser}
        disabled={submitting}
        style={{
          padding: 16,
          borderRadius: 10,
          alignItems: 'center',
          opacity: submitting ? 0.6 : 1,
          borderWidth: 1,
        }}
      >
        <Text style={{ fontWeight: '600' }}>
          {submitting ? 'Creating...' : 'Create account'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
