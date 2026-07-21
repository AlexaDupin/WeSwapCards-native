import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';

import { setUnauthorizedHandler } from '@/src/lib/apiAuthEvents';

// Wires the API's 401 responses to Clerk sign-out. When the backend rejects the
// session token, the Clerk client can still report `isSignedIn`, so the app
// would otherwise keep retrying a dead session (there is no demo mode to fall
// back on). Signing out flips `isSignedIn`, and the existing (tabs) guard
// redirects to sign-in — no manual navigation needed here.
export const useApiAuthErrorHandler = (): void => {
  const { isSignedIn, signOut } = useAuth();

  useEffect(() => {
    // Only react to 401s while signed in; a 401 when already signed out is
    // meaningless and signing out again would be a no-op.
    if (!isSignedIn) return;

    setUnauthorizedHandler(() => {
      void signOut();
    });

    return () => setUnauthorizedHandler(null);
  }, [isSignedIn, signOut]);
};
