import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useTip } from '@/src/features/tips/hooks/useTip';

// Scope: the storage gate is the whole of this feature's logic, and the part
// with real consequences — a wrong key silences a tip for the wrong person, and
// an unhandled store failure would either crash the tab or nag on every launch.
// TipBubble's rendering is covered in ../../tests/TipBubble.test.tsx.

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

let mockExplorerId: number | null = 42;
jest.mock('@/src/features/auth/context/ExplorerContext', () => ({
  useExplorer: () => ({ explorerId: mockExplorerId }),
}));

const store = jest.requireMock('expo-secure-store') as {
  getItemAsync: jest.Mock;
  setItemAsync: jest.Mock;
};

beforeEach(() => {
  mockExplorerId = 42;
  store.getItemAsync.mockReset().mockResolvedValue(null);
  store.setItemAsync.mockReset().mockResolvedValue(undefined);
});

describe('useTip', () => {
  it('shows a tip the explorer has never dismissed', async () => {
    const { result } = renderHook(() => useTip('cards'));

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('unseen'));
  });

  it('stays hidden once dismissed', async () => {
    store.getItemAsync.mockResolvedValue('true');

    const { result } = renderHook(() => useTip('cards'));

    await waitFor(() => expect(result.current.status).toBe('seen'));
  });

  it('scopes the flag to the explorer and the tip', async () => {
    renderHook(() => useTip('swap'));

    await waitFor(() => expect(store.getItemAsync).toHaveBeenCalled());
    expect(store.getItemAsync).toHaveBeenCalledWith('tip.42.swap');
  });

  it('does not let one explorer’s dismissal silence another’s tip', async () => {
    const first = renderHook(() => useTip('cards'));
    await waitFor(() => expect(first.result.current.status).toBe('unseen'));
    act(() => first.result.current.dismiss());
    expect(store.setItemAsync).toHaveBeenCalledWith('tip.42.cards', 'true');

    // A different explorer on the same device reads a different key, which the
    // store has no value for.
    mockExplorerId = 7;
    const second = renderHook(() => useTip('cards'));

    await waitFor(() => expect(second.result.current.status).toBe('unseen'));
    expect(store.getItemAsync).toHaveBeenLastCalledWith('tip.7.cards');
  });

  it('hides immediately on dismiss, before the write settles', async () => {
    let resolveWrite: () => void = () => {};
    store.setItemAsync.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveWrite = resolve;
      }),
    );

    const { result } = renderHook(() => useTip('cards'));
    await waitFor(() => expect(result.current.status).toBe('unseen'));

    act(() => result.current.dismiss());
    expect(result.current.status).toBe('seen');

    await act(async () => {
      resolveWrite();
    });
  });

  it('stays quiet when the store cannot be read', async () => {
    store.getItemAsync.mockRejectedValue(new Error('keychain unavailable'));

    const { result } = renderHook(() => useTip('cards'));

    await waitFor(() => expect(result.current.status).toBe('seen'));
  });

  it('survives a failed write', async () => {
    store.setItemAsync.mockRejectedValue(new Error('keychain unavailable'));

    const { result } = renderHook(() => useTip('cards'));
    await waitFor(() => expect(result.current.status).toBe('unseen'));

    act(() => result.current.dismiss());

    expect(result.current.status).toBe('seen');
  });

  it('shows nothing until the explorer resolves', async () => {
    mockExplorerId = null;

    const { result } = renderHook(() => useTip('cards'));

    await waitFor(() => expect(store.getItemAsync).not.toHaveBeenCalled());
    expect(result.current.status).toBe('loading');
  });
});
