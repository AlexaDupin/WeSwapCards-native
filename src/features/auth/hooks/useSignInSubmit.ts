import { useSignIn } from '@clerk/clerk-expo';
import { type Href, useRouter } from 'expo-router';
import { useCallback } from 'react';

import { getClerkErrorCode, getSignInErrorMessage } from '../data/authErrors';
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
  const router = useRouter();
  const { resetExplorer } = useExplorer();

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

      resetExplorer();
      await setActive({ session: signInAttempt.createdSessionId });
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
    resetExplorer,
    setError,
    setIsSubmitting,
  ]);

  return { onSignInPress };
}
