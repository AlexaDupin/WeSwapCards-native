import { useSignIn } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useCallback } from "react";
import { getClerkErrorCode, getSignInErrorMessage } from "../data/authErrors";

type Params = {
    emailAddress: string;
    password: string;
    isSubmitting: boolean;
    setIsSubmitting: (v: boolean) => void;
    setError: (v: string) => void;
    redirectTo?: string;
  };
  
export function useSignInSubmit({
    emailAddress,
    password,
    isSubmitting,
    setIsSubmitting,
    setError,
    redirectTo = "/(tabs)/cards",
}: Params) {
    const { signIn, setActive, isLoaded } = useSignIn();
    const router = useRouter();
  
    const onSignInPress = useCallback(async () => {
      if (!isLoaded || isSubmitting) return;
  
      if (!emailAddress.trim() || !password) {
        setError("Please enter your email and password.");
        return;
      }

      if (!signIn) {
        setError("Sign-in not available. Please try again.");
        return;
      }
  
      setIsSubmitting(true);
      setError("");
  
      try {
        const signInAttempt = await signIn.create({
          identifier: emailAddress.trim(),
          password,
        });
  
        if (signInAttempt.status === "complete") {
          await setActive({ session: signInAttempt.createdSessionId });
          router.replace(redirectTo);
        } else {
          console.error(JSON.stringify(signInAttempt, null, 2));
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
      redirectTo,
      router,
      setActive,
      setError,
      setIsSubmitting,
      signIn,
    ]);
  
    return { onSignInPress };
}