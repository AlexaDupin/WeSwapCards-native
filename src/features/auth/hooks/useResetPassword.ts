import { useSignIn } from '@clerk/clerk-expo';
import { useCallback } from 'react';

import {
  getClerkErrorCode,
  getClerkErrorMessage,
  getResetPasswordErrorMessage,
  getResetPasswordRequestErrorMessage,
} from '../data/authErrors';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';

type Params = {
  emailAddress: string;
  code: string;
  password: string;

  pendingReset: boolean;
  setPendingReset: (v: boolean) => void;

  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;

  setError: (v: string) => void;
};

/**
 * Drives Clerk's headless password reset. Web gets this from the prebuilt
 * <SignIn /> component; on native we run the same two-step email-code strategy
 * by hand: request a code, then submit the code together with the new password.
 */
export function useResetPassword({
  emailAddress,
  code,
  password,
  pendingReset,
  setPendingReset,
  isSubmitting,
  setIsSubmitting,
  setError,
}: Params) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { resetExplorer } = useExplorer();

  const onRequestResetPress = useCallback(async () => {
    if (!isLoaded || isSubmitting) return;

    const email = emailAddress.trim();
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    if (!signIn) {
      setError('Password reset is not available right now. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setPendingReset(true);
    } catch (err: unknown) {
      console.error(err);
      const errorCode = getClerkErrorCode(err);
      setError(getResetPasswordRequestErrorMessage(errorCode));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isLoaded,
    isSubmitting,
    emailAddress,
    signIn,
    setPendingReset,
    setError,
    setIsSubmitting,
  ]);

  const onResetPasswordPress = useCallback(async () => {
    if (!isLoaded || isSubmitting) return;

    if (!pendingReset) return;

    const otp = code.trim();
    if (!otp || !password) {
      setError('Please enter the code and your new password.');
      return;
    }

    if (!signIn) {
      setError('Password reset is not available right now. Please try again.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: otp,
        password,
      });

      if (attempt.status === 'complete') {
        // A completed reset returns a fresh session; clear stale explorer state
        // before it goes active so a previous user's data can't leak in.
        resetExplorer();
        await setActive({ session: attempt.createdSessionId });
        return;
      }

      console.error(JSON.stringify(attempt, null, 2));
      setError('Additional verification is required to reset your password.');
    } catch (err: unknown) {
      console.error(err);
      const errorCode = getClerkErrorCode(err);
      const fallback = getClerkErrorMessage(err);
      setError(getResetPasswordErrorMessage(errorCode, fallback));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isLoaded,
    isSubmitting,
    pendingReset,
    code,
    password,
    signIn,
    setActive,
    resetExplorer,
    setError,
    setIsSubmitting,
  ]);

  return { onRequestResetPress, onResetPasswordPress };
}
