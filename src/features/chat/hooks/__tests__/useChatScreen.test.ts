import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';

import { useChatScreen } from '@/src/features/chat/hooks/useChatScreen';

// Mock the boundaries: chat API, auth token, explorer identity, keyboard.
jest.mock('@/src/features/chat/api/chatApi', () => ({
  getAllMessages: jest.fn(),
  markConversationRead: jest.fn(),
  postMessage: jest.fn(),
  createConversation: jest.fn(),
  updateConversationStatus: jest.fn(),
}));

const mockGetToken = jest.fn();
jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => ({ getToken: mockGetToken }),
}));

// Starts with "mock" so the jest.mock factory may close over it.
let mockExplorerId: number | null = 3;
jest.mock('@/src/features/auth/context/ExplorerContext', () => ({
  useExplorer: () => ({ explorerId: mockExplorerId }),
}));

jest.mock('@/src/hooks/useKeyboardVisible', () => ({
  useKeyboardVisible: () => false,
}));

// expo-router's useFocusEffect needs a navigation context; in tests run the
// focus callback as a plain mount effect so the polling setup is exercised
// without one.
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void | (() => void)) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    React.useEffect(() => cb(), [cb]);
  },
}));

const chatApi = jest.requireMock(
  '@/src/features/chat/api/chatApi',
) as jest.Mocked<typeof import('@/src/features/chat/api/chatApi')>;

const messages = [
  {
    id: 1,
    content: 'hello',
    timestamp: '2026-06-10T12:00:00.000Z',
    sender_id: 9,
    recipient_id: 3,
    conversation_id: 7,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockExplorerId = 3;
  mockGetToken.mockResolvedValue('tkn');
  chatApi.getAllMessages.mockResolvedValue({
    allMessages: messages,
    conversationStatus: 'In progress',
  });
  chatApi.markConversationRead.mockResolvedValue(undefined);
  chatApi.postMessage.mockResolvedValue(undefined);
  chatApi.updateConversationStatus.mockResolvedValue(undefined);
  chatApi.createConversation.mockResolvedValue({ id: 100 });
});

function setup(args: Partial<Parameters<typeof useChatScreen>[0]> = {}) {
  return renderHook(() =>
    useChatScreen({
      conversationId: null,
      swapExplorerId: 9,
      cardName: 'Card 5',
      ...args,
    }),
  );
}

describe('initial load', () => {
  it('loads messages and marks the conversation read for an existing conversation', async () => {
    const { result } = setup({ conversationId: 7 });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(chatApi.getAllMessages).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 7 }),
    );
    expect(result.current.messages).toEqual(messages);
    expect(result.current.conversationStatus).toBe('In progress');
    expect(chatApi.markConversationRead).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 7, explorerId: 3 }),
    );
  });

  it('does not load for a new conversation (no id yet)', () => {
    const { result } = setup({ conversationId: null });

    expect(result.current.loading).toBe(false);
    expect(chatApi.getAllMessages).not.toHaveBeenCalled();
  });

  it('surfaces a load error', async () => {
    chatApi.getAllMessages.mockRejectedValueOnce(new Error('boom'));
    const { result } = setup({ conversationId: 7 });

    await waitFor(() =>
      expect(result.current.error).toBe('Could not load messages'),
    );
    expect(result.current.loading).toBe(false);
  });
});

describe('canSend', () => {
  it('requires text, an explorer, and a swap partner', () => {
    const { result } = setup({ swapExplorerId: 9 });
    expect(result.current.canSend).toBe(false); // no text

    act(() => result.current.setText('hi'));
    expect(result.current.canSend).toBe(true);
  });

  it('is false without a swap partner', () => {
    const { result } = setup({ swapExplorerId: null });
    act(() => result.current.setText('hi'));
    expect(result.current.canSend).toBe(false);
  });
});

describe('sendMessage', () => {
  it('posts a trimmed message, refreshes, marks read, and clears the input on an existing conversation', async () => {
    const { result } = setup({ conversationId: 7 });
    await waitFor(() => expect(result.current.loading).toBe(false));

    chatApi.getAllMessages.mockClear();
    chatApi.markConversationRead.mockClear();

    act(() => result.current.setText('  trade?  '));
    await act(async () => {
      await result.current.sendMessage();
    });

    expect(chatApi.createConversation).not.toHaveBeenCalled();
    expect(chatApi.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 7,
        payload: expect.objectContaining({
          content: 'trade?', // trimmed
          sender_id: 3,
          recipient_id: 9,
          conversation_id: 7,
        }),
      }),
    );
    // Refresh + mark read after sending.
    expect(chatApi.getAllMessages).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 7 }),
    );
    expect(chatApi.markConversationRead).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 7 }),
    );
    expect(result.current.text).toBe('');
  });

  it('lazily creates the conversation on the first send and posts with the new id', async () => {
    const { result } = setup({ conversationId: null });

    act(() => result.current.setText('first message'));
    await act(async () => {
      await result.current.sendMessage();
    });

    expect(chatApi.createConversation).toHaveBeenCalledWith(
      expect.objectContaining({
        explorerId: 3,
        swapExplorerId: 9,
        cardName: 'Card 5',
      }),
    );
    // The freshly created id (100) flows into the message + refresh.
    expect(chatApi.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        conversationId: 100,
        payload: expect.objectContaining({ conversation_id: 100 }),
      }),
    );
    expect(chatApi.getAllMessages).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 100 }),
    );
  });

  // Guards the reporting path: a report filed right after the first message of
  // a brand-new conversation must carry the created id, not null.
  it('exposes the created id so later callers see the resolved conversation', async () => {
    const { result } = setup({ conversationId: null });

    expect(result.current.conversationId).toBeNull();

    act(() => result.current.setText('first message'));
    await act(async () => {
      await result.current.sendMessage();
    });

    expect(result.current.conversationId).toBe(100);
  });

  it('reports a send failure and stops sending', async () => {
    chatApi.postMessage.mockRejectedValueOnce(new Error('network'));
    const { result } = setup({ conversationId: 7 });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setText('hi'));
    await act(async () => {
      await result.current.sendMessage();
    });

    expect(result.current.error).toBe('Could not send message');
    expect(result.current.sending).toBe(false);
  });
});

describe('polling and pull-to-refresh', () => {
  beforeEach(() => {
    // The poll only fetches while the app is foregrounded.
    (AppState as unknown as { currentState: string }).currentState = 'active';
  });

  it('refetches and clears the flag on pull-to-refresh', async () => {
    const { result } = setup({ conversationId: 7 });
    await waitFor(() => expect(result.current.loading).toBe(false));
    chatApi.getAllMessages.mockClear();

    await act(async () => {
      await result.current.onRefresh();
    });

    expect(chatApi.getAllMessages).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 7 }),
    );
    expect(result.current.refreshing).toBe(false);
  });

  it('polls every 5s while focused and marks read when new messages arrive', async () => {
    jest.useFakeTimers();
    try {
      const { result } = setup({ conversationId: 7 });
      // Flush the initial load.
      await act(async () => {
        await jest.advanceTimersByTimeAsync(0);
      });
      expect(chatApi.getAllMessages).toHaveBeenCalledTimes(1);

      const more = [
        ...messages,
        {
          id: 2,
          content: 'any news?',
          timestamp: '2026-06-10T12:05:00.000Z',
          sender_id: 9,
          recipient_id: 3,
          conversation_id: 7,
        },
      ];
      chatApi.getAllMessages.mockResolvedValue({
        allMessages: more,
        conversationStatus: 'In progress',
      });
      chatApi.markConversationRead.mockClear();

      await act(async () => {
        await jest.advanceTimersByTimeAsync(5000);
      });

      expect(chatApi.getAllMessages).toHaveBeenCalledTimes(2);
      expect(result.current.messages).toEqual(more);
      expect(chatApi.markConversationRead).toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not re-mark read when a poll brings no new messages', async () => {
    jest.useFakeTimers();
    try {
      setup({ conversationId: 7 });
      await act(async () => {
        await jest.advanceTimersByTimeAsync(0);
      });
      chatApi.markConversationRead.mockClear();

      // Same messages returned again on the next poll.
      await act(async () => {
        await jest.advanceTimersByTimeAsync(5000);
      });

      expect(chatApi.getAllMessages).toHaveBeenCalledTimes(2);
      expect(chatApi.markConversationRead).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });
});

describe('setConversationStatus', () => {
  it('updates the status and resolves true on success', async () => {
    const { result } = setup({ conversationId: 7 });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let returned: boolean | undefined;
    await act(async () => {
      returned = await result.current.setConversationStatus('Completed');
    });

    expect(chatApi.updateConversationStatus).toHaveBeenCalledWith(
      expect.objectContaining({ conversationId: 7, status: 'Completed' }),
    );
    expect(returned).toBe(true);
  });

  it('resolves false and sets an error on failure', async () => {
    chatApi.updateConversationStatus.mockRejectedValueOnce(new Error('boom'));
    const { result } = setup({ conversationId: 7 });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let returned: boolean | undefined;
    await act(async () => {
      returned = await result.current.setConversationStatus('Declined');
    });

    expect(returned).toBe(false);
    expect(result.current.error).toBe('Could not update conversation status');
  });
});
