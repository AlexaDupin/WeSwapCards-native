// Bridge between the axios response interceptor (module scope, no React) and
// Clerk's `signOut`, which is only reachable through a hook. A component
// registers the handler once it's mounted inside ClerkProvider; the interceptor
// invokes it when the API rejects the session token with a 401.

type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (
  fn: UnauthorizedHandler | null,
): void => {
  handler = fn;
};

export const notifyUnauthorized = (): void => {
  handler?.();
};
