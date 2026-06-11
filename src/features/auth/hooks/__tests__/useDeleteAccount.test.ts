import { Alert } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useDeleteAccount } from '@/src/features/auth/hooks/useDeleteAccount';

// Mock the boundaries: the API, Clerk, the router, and the notifications
// provider. The hook orchestrates an irreversible delete, so we verify both the
// success ordering and that failures don't navigate the user away.

jest.mock('@/src/features/auth/api/userApi', () => ({
  deleteAccount: jest.fn(),
}));

const mockClearLocal = jest.fn().mockResolvedValue(undefined);
jest.mock('@/src/features/notifications/NotificationsProvider', () => ({
  useNotifications: () => ({ clearLocal: mockClearLocal }),
}));

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockGetToken = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue(undefined);
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ getToken: mockGetToken }),
  useClerk: () => ({ signOut: mockSignOut }),
}));

const userApi = jest.requireMock('@/src/features/auth/api/userApi') as {
  deleteAccount: jest.Mock;
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  mockGetToken.mockResolvedValue('tkn');
  userApi.deleteAccount.mockResolvedValue(undefined);
});

// Pull the destructive "Delete" button's onPress out of the confirmation Alert.
function pressDestructive() {
  const buttons = (Alert.alert as jest.Mock).mock.calls[0]?.[2] as
    | { text: string; style?: string; onPress?: () => void }[]
    | undefined;
  const destructive = buttons?.find((b) => b.style === 'destructive');
  destructive?.onPress?.();
}

describe('useDeleteAccount', () => {
  it('confirms before doing anything destructive', () => {
    const { result } = renderHook(() => useDeleteAccount());

    act(() => result.current.confirmAndDelete());

    expect(Alert.alert).toHaveBeenCalledTimes(1);
    expect(userApi.deleteAccount).not.toHaveBeenCalled();
  });

  it('deletes, clears local state, signs out, and navigates home on confirm', async () => {
    const { result } = renderHook(() => useDeleteAccount());

    act(() => result.current.confirmAndDelete());
    await act(async () => {
      pressDestructive();
    });

    await waitFor(() =>
      expect(userApi.deleteAccount).toHaveBeenCalledWith({ token: 'tkn' }),
    );
    expect(mockClearLocal).toHaveBeenCalled();
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('shows an error and does not navigate when the delete fails', async () => {
    userApi.deleteAccount.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useDeleteAccount());

    act(() => result.current.confirmAndDelete());
    await act(async () => {
      pressDestructive();
    });

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Could not delete account',
        expect.any(String),
      ),
    );
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it('does not call the API when no auth token is available', async () => {
    mockGetToken.mockResolvedValue(null);
    const { result } = renderHook(() => useDeleteAccount());

    act(() => result.current.confirmAndDelete());
    await act(async () => {
      pressDestructive();
    });

    await waitFor(() => expect(Alert.alert).toHaveBeenCalledTimes(2));
    expect(userApi.deleteAccount).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
