import { renderHook } from '@testing-library/react-native';

import { useApiAuthErrorHandler } from '@/src/features/auth/hooks/useApiAuthErrorHandler';
import { notifyUnauthorized } from '@/src/lib/apiAuthEvents';

// The hook bridges the axios 401 interceptor to Clerk sign-out. We drive it
// through the real event bridge (notifyUnauthorized) and assert it signs out
// only while signed in, and unregisters on unmount.

const mockSignOut = jest.fn().mockResolvedValue(undefined);
let mockIsSignedIn = true;

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ isSignedIn: mockIsSignedIn, signOut: mockSignOut }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockIsSignedIn = true;
});

describe('useApiAuthErrorHandler', () => {
  it('signs out when a 401 fires while signed in', () => {
    renderHook(() => useApiAuthErrorHandler());

    notifyUnauthorized();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('does not register a handler when signed out', () => {
    mockIsSignedIn = false;
    renderHook(() => useApiAuthErrorHandler());

    notifyUnauthorized();

    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('unregisters on unmount so later 401s are ignored', () => {
    const { unmount } = renderHook(() => useApiAuthErrorHandler());

    unmount();
    notifyUnauthorized();

    expect(mockSignOut).not.toHaveBeenCalled();
  });
});
