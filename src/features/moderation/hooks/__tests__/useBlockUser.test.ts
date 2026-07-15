import { Alert } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useBlockUser } from '@/src/features/moderation/hooks/useBlockUser';

// Mock the boundaries: the API, Clerk, and the explorer context. The hook owns
// a destructive-ish action (blocking), so we verify the confirm-before-act flow
// and that the block state only flips on API success.

jest.mock('@/src/features/moderation/api/moderationApi', () => ({
  getMyBlocks: jest.fn(),
  blockUser: jest.fn(),
  unblockUser: jest.fn(),
}));

const mockGetToken = jest.fn();
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ getToken: mockGetToken }),
}));

jest.mock('@/src/features/auth/context/ExplorerContext', () => ({
  useExplorer: () => ({ explorerId: 3 }),
}));

const moderationApi = jest.requireMock(
  '@/src/features/moderation/api/moderationApi',
) as {
  getMyBlocks: jest.Mock;
  blockUser: jest.Mock;
  unblockUser: jest.Mock;
};

const headers = { Authorization: 'Bearer tkn' };

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});

  mockGetToken.mockResolvedValue('tkn');
  moderationApi.getMyBlocks.mockResolvedValue([]);
  moderationApi.blockUser.mockResolvedValue(undefined);
  moderationApi.unblockUser.mockResolvedValue(undefined);
});

// Pull the confirming button's onPress out of the latest confirmation Alert.
function pressConfirm() {
  const calls = (Alert.alert as jest.Mock).mock.calls;
  const buttons = calls[calls.length - 1]?.[2] as
    | { text: string; style?: string; onPress?: () => void }[]
    | undefined;
  const confirm = buttons?.find((b) => b.style !== 'cancel');
  confirm?.onPress?.();
}

function setup() {
  return renderHook(() => useBlockUser({ swapExplorerId: 9, swapName: 'Sam' }));
}

describe('useBlockUser', () => {
  it('loads my blocks on mount and reports not-blocked', async () => {
    const { result } = setup();

    await waitFor(() => expect(result.current.isBlockedByMe).toBe(false));
    expect(moderationApi.getMyBlocks).toHaveBeenCalledWith({
      explorerId: 3,
      headers,
    });
  });

  it('reports blocked when the partner is in my block list', async () => {
    moderationApi.getMyBlocks.mockResolvedValue([
      { blocked_id: 9, blocked_name: 'Sam', created_at: '2026-07-15' },
    ]);
    const { result } = setup();

    await waitFor(() => expect(result.current.isBlockedByMe).toBe(true));
  });

  it('stays null (no block UI) when the list fails to load', async () => {
    moderationApi.getMyBlocks.mockRejectedValue(new Error('network'));
    const { result } = setup();

    await act(async () => {});
    expect(result.current.isBlockedByMe).toBe(null);
  });

  it('confirms before blocking, then blocks on confirm', async () => {
    const { result } = setup();
    await waitFor(() => expect(result.current.isBlockedByMe).toBe(false));

    act(() => result.current.toggleBlock());
    expect(Alert.alert).toHaveBeenCalledWith(
      'Block Sam?',
      expect.stringContaining('Existing messages stay visible'),
      expect.any(Array),
    );
    expect(moderationApi.blockUser).not.toHaveBeenCalled();

    await act(async () => {
      pressConfirm();
    });

    await waitFor(() =>
      expect(moderationApi.blockUser).toHaveBeenCalledWith({
        explorerId: 3,
        targetExplorerId: 9,
        headers,
      }),
    );
    expect(result.current.isBlockedByMe).toBe(true);
  });

  it('unblocks on confirm when already blocked', async () => {
    moderationApi.getMyBlocks.mockResolvedValue([
      { blocked_id: 9, blocked_name: 'Sam', created_at: '2026-07-15' },
    ]);
    const { result } = setup();
    await waitFor(() => expect(result.current.isBlockedByMe).toBe(true));

    act(() => result.current.toggleBlock());
    await act(async () => {
      pressConfirm();
    });

    await waitFor(() =>
      expect(moderationApi.unblockUser).toHaveBeenCalledWith({
        explorerId: 3,
        targetExplorerId: 9,
        headers,
      }),
    );
    expect(result.current.isBlockedByMe).toBe(false);
  });

  it('keeps the previous state and alerts when the API call fails', async () => {
    moderationApi.blockUser.mockRejectedValue(new Error('network'));
    const { result } = setup();
    await waitFor(() => expect(result.current.isBlockedByMe).toBe(false));

    act(() => result.current.toggleBlock());
    await act(async () => {
      pressConfirm();
    });

    await waitFor(() =>
      expect(Alert.alert).toHaveBeenCalledWith(
        'Something went wrong',
        expect.any(String),
      ),
    );
    expect(result.current.isBlockedByMe).toBe(false);
  });
});
