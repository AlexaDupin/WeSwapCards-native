import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SwapScreen from '@/src/features/swap/components/SwapScreen';
import {
  createCard,
  createChapter,
  createOpportunitiesPage,
  createOpportunity,
} from '@/src/features/swap/testFixtures';

// ---- Module mocks ----
// Render the real SwapScreen + useSwap hook + child components, mocking only the
// boundaries: api, auth, router, and navigation focus effect.

const mockRouterPush = jest.fn();

// Captures the focus-effect cleanup so a "blur" can be simulated mid-test. Empty
// deps keep it from firing on every re-render (which would reset the view).
let mockFocusCleanup: undefined | (() => void);

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: jest.fn() }),
}));

jest.mock('@react-navigation/native', () => {
  const ReactActual = jest.requireActual<typeof import('react')>('react');
  return {
    useFocusEffect: (callback: () => undefined | (() => void)) => {
      ReactActual.useEffect(() => {
        mockFocusCleanup = callback();
        return mockFocusCleanup;
      }, []);
    },
  };
});

jest.mock('@/src/features/swap/api/swapApi', () => ({
  fetchChapters: jest.fn(),
  fetchLatestChapters: jest.fn(),
  fetchCardsForChapter: jest.fn(),
  fetchSwapOpportunities: jest.fn(),
}));

jest.mock('@/src/features/chat/api/chatApi', () => ({
  getConversation: jest.fn(),
}));

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: jest.fn(() => ({
    getToken: jest.fn().mockResolvedValue('test-token'),
  })),
}));

jest.mock('@/src/features/auth/context/ExplorerContext', () => ({
  useExplorer: jest.fn(() => ({ explorerId: 123 })),
}));

// ---- Typed mock access ----

const swapApi = jest.requireMock(
  '@/src/features/swap/api/swapApi',
) as jest.Mocked<typeof import('@/src/features/swap/api/swapApi')>;

const chatApi = jest.requireMock(
  '@/src/features/chat/api/chatApi',
) as jest.Mocked<typeof import('@/src/features/chat/api/chatApi')>;

// ---- Helpers ----

// Drives the screen from the initial (no chapter) view to a selected card with
// its single opportunity ("Bob") rendered.
async function selectChapterAndCard() {
  render(<SwapScreen />);

  // Wait until the chapters finish loading: the text label only renders once
  // loadingChapters flips false, which is also when the button stops being
  // disabled. Pressing the accessibilityLabel any earlier would be a no-op.
  await screen.findByText('Select a chapter');
  fireEvent.press(screen.getByLabelText('Select a chapter'));

  // Use findBy* for everything that appears after a press so the queries retry
  // instead of asserting against a single (possibly mid-update) render.
  fireEvent.press(await screen.findByText('Chapter 1'));
  fireEvent.press(await screen.findByLabelText('Select card 5'));

  await screen.findByText('Bob');
}

// ---- Setup ----

beforeEach(() => {
  jest.clearAllMocks();
  mockFocusCleanup = undefined;

  swapApi.fetchChapters.mockResolvedValue([
    createChapter({ id: 1, name: 'Chapter 1' }),
  ]);
  swapApi.fetchLatestChapters.mockResolvedValue([]);
  swapApi.fetchCardsForChapter.mockResolvedValue([createCard({ id: 5 })]);
  swapApi.fetchSwapOpportunities.mockResolvedValue(
    createOpportunitiesPage(
      [
        createOpportunity({
          explorer_id: 9,
          explorer_name: 'Bob',
          opportunities: [{ card: { id: 2, name: 'Card B' } }],
        }),
      ],
      1,
      1,
    ),
  );
  chatApi.getConversation.mockResolvedValue(null);
});

// ---- Tests ----

describe('SwapScreen', () => {
  it('walks chapter -> card -> opportunities and opens a new chat on contact', async () => {
    // Initial view (no chapter): latest-chapters section, no opportunities yet.
    render(<SwapScreen />);
    await waitFor(() =>
      expect(screen.getByText('Select a chapter')).toBeTruthy(),
    );
    expect(screen.getByText('Latest chapters')).toBeTruthy();
    expect(screen.queryByText('Bob')).toBeNull();
    screen.unmount();

    await selectChapterAndCard();

    // Chapter mode no longer shows the latest-chapters section.
    expect(screen.queryByText('Latest chapters')).toBeNull();

    fireEvent.press(screen.getByText('Contact'));

    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledTimes(1));
    expect(mockRouterPush).toHaveBeenCalledWith({
      pathname: '/(modal)/chat/[conversationId]',
      params: {
        conversationId: 'new',
        cardName: 'Card 5',
        swapName: 'Bob',
        swapExplorerId: '9',
        offeredCards: JSON.stringify([{ id: 2, name: 'Card B' }]),
      },
    });
  });

  it('passes the existing conversation id through to the chat route', async () => {
    chatApi.getConversation.mockResolvedValue({ id: 777 });

    await selectChapterAndCard();
    fireEvent.press(screen.getByText('Contact'));

    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledTimes(1));
    expect(mockRouterPush).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({ conversationId: '777' }),
      }),
    );
  });

  it('resets the view when the screen loses focus', async () => {
    await selectChapterAndCard();

    act(() => {
      mockFocusCleanup?.();
    });

    // Back to the initial view: opportunities gone, latest-chapters section back.
    await waitFor(() =>
      expect(screen.getByText('Latest chapters')).toBeTruthy(),
    );
    expect(screen.queryByText('Bob')).toBeNull();
  });

  it('does not reset the view when navigating to chat', async () => {
    await selectChapterAndCard();

    // Opening a chat marks the navigation so the blur must not reset state.
    fireEvent.press(screen.getByText('Contact'));
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledTimes(1));

    act(() => {
      mockFocusCleanup?.();
    });

    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.queryByText('Latest chapters')).toBeNull();
  });
});
