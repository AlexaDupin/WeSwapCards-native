import type { ClerkAPIError } from "@clerk/types";

export const getClerkErrorCode = (err: unknown) => {
  const e = err as { errors?: ClerkAPIError[] };
  return e?.errors?.[0]?.code;
};

export const getClerkErrorMessage = (err: unknown) => {
    const e = err as { errors?: ClerkAPIError[] };
    return e?.errors?.[0]?.message;
};

export function getSignInErrorMessage(code?: string) {
    switch (code) {
      case "form_password_incorrect":
        return "Password is incorrect. Please try again.";
      case "form_identifier_not_found":
        return "No account found for this email.";
      case "form_param_format_invalid":
        return "Please enter a valid email address.";
      default:
        return "An error occurred. Please try again.";
    }
}

export function getSignUpErrorMessage(code?: string, fallback?: string) {
    switch (code) {
      case "form_identifier_exists":
        return "That email address is already in use. Please try another.";
      case "form_param_format_invalid":
        return "Please enter a valid email address.";
      case "form_password_pwned":
        return "This password is too common. Please choose a stronger one.";
      default:
        return fallback || "An error occurred. Please try again.";
    }
  }
  
export function getVerifyEmailErrorMessage(code?: string, fallback?: string) {
    switch (code) {
      case "form_code_incorrect":
        return "That code is incorrect. Please try again.";
      case "form_code_expired":
        return "That code has expired. Request a new one.";
      default:
        return fallback || "Verification failed. Please try again.";
    }
}