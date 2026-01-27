import type { ClerkAPIError } from "@clerk/types";

export const getClerkErrorCode = (err: unknown) => {
  const e = err as { errors?: ClerkAPIError[] };
  return e?.errors?.[0]?.code;
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