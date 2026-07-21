import { useApiAuthErrorHandler } from '@/src/features/auth/hooks/useApiAuthErrorHandler';

// Headless component: registers the API 401 -> Clerk sign-out bridge for as long
// as it's mounted. Rendered once inside ClerkProvider in the root layout.
export function ApiAuthErrorHandler(): null {
  useApiAuthErrorHandler();
  return null;
}
