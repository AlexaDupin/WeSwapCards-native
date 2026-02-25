import { useSignIn, useAuth, useUser } from '@clerk/clerk-expo';
import { type Href, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { getClerkErrorCode, getSignInErrorMessage } from '../data/authErrors';
import { fetchExplorerInfo } from '@/src/features/auth/api/userApi';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';

type Params = {
  emailAddress: string;
  password: string;
  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;
  setError: (v: string) => void;
  redirectTo?: Href;
};

export function useSignInSubmit({
  emailAddress,
  password,
  isSubmitting,
  setIsSubmitting,
  setError,
  redirectTo = '/(tabs)/cards',
}: Params) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { getToken } = useAuth();

  const router = useRouter();
  const { setExplorer, resetExplorer } = useExplorer();

  const onSignInPress = useCallback(async () => {
    if (!isLoaded || isSubmitting) return;

    const email = emailAddress.trim();

    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }

    if (!signIn) {
      setError('Sign-in not available. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    resetExplorer();

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status !== 'complete') {
        console.error(JSON.stringify(signInAttempt, null, 2));
        setError('Sign-in incomplete. Please try again.');
        return;
      }

      await setActive({ session: signInAttempt.createdSessionId });

      // After Clerk session is active, call your backend to get explorerId
      if (!isUserLoaded || !user?.id) {
        // In rare cases, Clerk user isn't hydrated immediately after setActive.
        // Best UX is to route to a bootstrap screen; simplest is an error for now.
        setError('Signed in, but user not ready. Please try again.');
        return;
      }

      const token = await getToken();
      if (!token) {
        setError('Missing auth token. Please try again.');
        return;
      }
      console.log(user.id);

      const explorer = await fetchExplorerInfo({ token, userUID: user.id });

      if (explorer?.id) {
        setExplorer({
          explorerId: explorer.id,
          explorerName: explorer.name ?? null,
        });
        router.replace(redirectTo);
      } else {
        // No explorer row in DB yet -> go to username creation screen
        router.replace('/(auth)/register-user');
      }
    } catch (err: unknown) {
      console.error(err);
      const code = getClerkErrorCode(err);
      setError(getSignInErrorMessage(code));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isLoaded,
    isSubmitting,
    emailAddress,
    password,
    signIn,
    setActive,
    isUserLoaded,
    user?.id,
    getToken,
    router,
    redirectTo,
    resetExplorer,
    setExplorer,
    setError,
    setIsSubmitting,
  ]);

  return { onSignInPress };
}
