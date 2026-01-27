import { useSignUp } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  getClerkErrorCode,
  getClerkErrorMessage,
  getSignUpErrorMessage,
  getVerifyEmailErrorMessage,
} from "../data/authErrors";

type Params = {
  emailAddress: string;
  password: string;
  code: string;

  pendingVerification: boolean;
  setPendingVerification: (v: boolean) => void;

  isSubmitting: boolean;
  setIsSubmitting: (v: boolean) => void;

  setError: (v: string) => void;

  redirectTo?: string;
};

export function useSignUpSubmit({
  emailAddress,
  password,
  code,
  pendingVerification,
  setPendingVerification,
  isSubmitting,
  setIsSubmitting,
  setError,
  redirectTo = "/",
}: Params) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const onSignUpPress = useCallback(async () => {
    if (!isLoaded || isSubmitting) return;

    const email = emailAddress.trim();
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!signUp) {
      setError("Sign-up not available. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await signUp.create({
        emailAddress: email,
        password,
        legalAccepted: true,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: unknown) {
      console.error(err);
      const code = getClerkErrorCode(err);
      const fallback = getClerkErrorMessage(err);
      setError(getSignUpErrorMessage(code, fallback));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isLoaded,
    isSubmitting,
    emailAddress,
    password,
    signUp,
    setError,
    setIsSubmitting,
    setPendingVerification,
  ]);

  const onVerifyPress = useCallback(async () => {
    if (!isLoaded || isSubmitting) return;

    if (!pendingVerification) return;

    const otp: string = code.trim();
    if (!otp) {
      setError("Please enter the verification code.");
      return;
    }

    if (!signUp) {
      setError("Verification is not available right now. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: otp,
      });

      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace(redirectTo);
        return;
      }

      console.error(JSON.stringify(signUpAttempt, null, 2));
      setError("Additional verification is required.");
    } catch (err: unknown) {
      console.error(err);
      const code = getClerkErrorCode(err);
      const fallback = getClerkErrorMessage(err);
      setError(getVerifyEmailErrorMessage(code, fallback));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isLoaded,
    isSubmitting,
    pendingVerification,
    code,
    signUp,
    setActive,
    router,
    redirectTo,
    setError,
    setIsSubmitting,
  ]);

  return { onSignUpPress, onVerifyPress };
}
