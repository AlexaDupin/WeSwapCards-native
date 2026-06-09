import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useSwap, type UseSwapOptions } from '@/src/features/swap/hooks/useSwap';
import type { SwapOpportunitiesResponse } from '@/src/features/swap/types/SwapTypes';
import {
  createCard,
  createOpportunitiesPage,
  createOpportunity,
} from '@/src/features/swap/testFixtures';

// ---- Module mocks ----

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

const { useExplorer } = jest.requireMock(
  '@/src/features/auth/context/ExplorerContext',
) as { useExplorer: jest.Mock };

// ---- Helpers ----

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

// Renders the hook and waits for the initial chapters load to settle.
async function renderReady(options?: UseSwapOptions) {
  const hook = renderHook(() => useSwap(options));
  await waitFor(() => {
    expect(hook.result.current.loadingChapters).toBe(false);
  });
  return hook;
}

// ---- Setup ----

beforeEach(() => {
  jest.clearAllMocks();
  useExplorer.mockReturnValue({ explorerId: 123 });
  swapApi.fetchChapters.mockResolvedValue([]);
  swapApi.fetchLatestChapters.mockResolvedValue([]);
  swapApi.fetchCardsForChapter.mockResolvedValue([]);
});

// ---- Tests ----

describe('useSwap', () => {
  it('loads chapters and latest chapters on mount', async () => {
    swapApi.fetchChapters.mockResolvedValue([{ id: 1, name: 'Chapter 1' }]);
    swapApi.fetchLatestChapters.mockResolvedValue([{ id: 9, name: 'Latest' }]);

    const { result } = await renderReady();

    expect(swapApi.fetchChapters).toHaveBeenCalledTimes(1);
    expect(swapApi.fetchLatestChapters).toHaveBeenCalledWith({ limit: 8 });
    expect(result.current.chapters).toEqual([{ id: 1, name: 'Chapter 1' }]);
    expect(result.current.latestChapters).toEqual([{ id: 9, name: 'Latest' }]);
  });

  it('loads a chapter\'s cards and resets the selected card and opportunities when the chapter changes', async () => {
    swapApi.fetchCardsForChapter
      .mockResolvedValueOnce([createCard({ id: 5 })])
      .mockResolvedValueOnce([createCard({ id: 8, name: 'Card 8', number: 8 })]);
    swapApi.fetchSwapOpportunities.mockResolvedValue(
      createOpportunitiesPage([createOpportunity({ explorer_id: 1 })], 1, 1),
    );

    const { result } = await renderReady();

    await act(async () => {
      await result.current.selectChapter(7);
    });
    await waitFor(() => expect(result.current.cards).toHaveLength(1));
    expect(swapApi.fetchCardsForChapter).toHaveBeenCalledWith({ chapterId: 7 });

    await act(async () => {
      await result.current.selectCard(5);
    });
    await waitFor(() => expect(result.current.opportunities).toHaveLength(1));

    // Switching chapters must clear the prior card selection and its results.
    await act(async () => {
      await result.current.selectChapter(8);
    });
    await waitFor(() =>
      expect(result.current.cards).toEqual([
        createCard({ id: 8, name: 'Card 8', number: 8 }),
      ]),
    );

    expect(result.current.selectedChapterId).toBe(8);
    expect(result.current.selectedCardId).toBeNull();
    expect(result.current.opportunities).toEqual([]);
    expect(result.current.opportunitiesPagination).toBeNull();
  });

  it('loads opportunities page 1 when a card is selected and clears them on null', async () => {
    swapApi.fetchSwapOpportunities.mockResolvedValue(
      createOpportunitiesPage([createOpportunity({ explorer_id: 1 })], 1, 1),
    );

    const { result } = await renderReady();

    await act(async () => {
      await result.current.selectCard(5);
    });

    await waitFor(() => expect(result.current.opportunities).toHaveLength(1));
    expect(swapApi.fetchSwapOpportunities).toHaveBeenCalledWith(
      expect.objectContaining({
        explorerId: 123,
        cardId: 5,
        page: 1,
        limit: 20,
      }),
    );

    await act(async () => {
      await result.current.selectCard(null);
    });

    expect(result.current.opportunities).toEqual([]);
    expect(result.current.opportunitiesPagination).toBeNull();
    // No additional fetch is fired for the null selection.
    expect(swapApi.fetchSwapOpportunities).toHaveBeenCalledTimes(1);
  });

  it('appends the next page and stops fetching once the last page is reached', async () => {
    swapApi.fetchSwapOpportunities
      .mockResolvedValueOnce(
        createOpportunitiesPage([createOpportunity({ explorer_id: 1 })], 1, 2),
      )
      .mockResolvedValueOnce(
        createOpportunitiesPage([createOpportunity({ explorer_id: 2 })], 2, 2),
      );

    const { result } = await renderReady();

    await act(async () => {
      await result.current.selectCard(5);
    });
    await waitFor(() =>
      expect(result.current.canLoadMoreOpportunities).toBe(true),
    );

    await act(async () => {
      await result.current.loadMoreOpportunities();
    });
    await waitFor(() =>
      expect(result.current.opportunities.map((o) => o.explorer_id)).toEqual([
        1, 2,
      ]),
    );
    expect(result.current.canLoadMoreOpportunities).toBe(false);

    // On the last page already: another load-more must not fetch again.
    await act(async () => {
      await result.current.loadMoreOpportunities();
    });
    expect(swapApi.fetchSwapOpportunities).toHaveBeenCalledTimes(2);
  });

  it('deduplicates overlapping explorers when loading more opportunity pages', async () => {
    // Page 2 overlaps page 1 on explorer_id 2 — the row drifted past the page
    // boundary between fetches (offset pagination over a volatile sort).
    swapApi.fetchSwapOpportunities
      .mockResolvedValueOnce(
        createOpportunitiesPage(
          [
            createOpportunity({ explorer_id: 1 }),
            createOpportunity({ explorer_id: 2 }),
          ],
          1,
          2,
        ),
      )
      .mockResolvedValueOnce(
        createOpportunitiesPage(
          [
            createOpportunity({ explorer_id: 2 }),
            createOpportunity({ explorer_id: 3 }),
          ],
          2,
          2,
        ),
      );

    const { result } = await renderReady();

    await act(async () => {
      await result.current.selectCard(1);
    });
    await waitFor(() =>
      expect(result.current.opportunities.map((o) => o.explorer_id)).toEqual([
        1, 2,
      ]),
    );

    await act(async () => {
      await result.current.loadMoreOpportunities();
    });
    await waitFor(() =>
      expect(result.current.opportunities.map((o) => o.explorer_id)).toEqual([
        1, 2, 3,
      ]),
    );
  });

  it('ignores a superseded opportunities response after a rapid card switch', async () => {
    const slowCard1 = deferred<SwapOpportunitiesResponse>();
    swapApi.fetchSwapOpportunities
      .mockReturnValueOnce(slowCard1.promise)
      .mockResolvedValueOnce(
        createOpportunitiesPage([createOpportunity({ explorer_id: 2 })], 1, 1),
      );

    const { result } = await renderReady();

    // Card 1's request is still in flight...
    let card1Call!: Promise<void>;
    await act(async () => {
      card1Call = result.current.selectCard(1);
    });

    // ...when the user switches to card 2, whose response resolves immediately.
    await act(async () => {
      await result.current.selectCard(2);
    });
    await waitFor(() =>
      expect(result.current.opportunities.map((o) => o.explorer_id)).toEqual([
        2,
      ]),
    );

    // The late card-1 response must be discarded, not clobber card 2's list.
    await act(async () => {
      slowCard1.resolve(
        createOpportunitiesPage([createOpportunity({ explorer_id: 1 })], 1, 1),
      );
      await card1Call;
    });

    expect(result.current.opportunities.map((o) => o.explorer_id)).toEqual([2]);
  });

  it('surfaces an error when the opportunities fetch fails', async () => {
    swapApi.fetchSwapOpportunities.mockRejectedValue(new Error('network down'));

    const { result } = await renderReady();

    await act(async () => {
      await result.current.selectCard(5);
    });

    await waitFor(() =>
      expect(result.current.error?.code).toBe('opportunities_fetch_failed'),
    );
    expect(result.current.loadingOpportunities).toBe(false);
    expect(result.current.loadingMoreOpportunities).toBe(false);
  });

  it('requires sign-in and skips the fetch when there is no explorerId', async () => {
    useExplorer.mockReturnValue({ explorerId: null });

    const { result } = await renderReady();

    await act(async () => {
      await result.current.selectCard(5);
    });

    await waitFor(() =>
      expect(result.current.error?.code).toBe('sign_in_required'),
    );
    expect(swapApi.fetchSwapOpportunities).not.toHaveBeenCalled();
  });

  it('opens a chat via contact with the right payload and ignores concurrent calls', async () => {
    swapApi.fetchCardsForChapter.mockResolvedValue([createCard({ id: 5 })]);
    swapApi.fetchSwapOpportunities.mockResolvedValue(
      createOpportunitiesPage([createOpportunity({ explorer_id: 1 })], 1, 1),
    );
    const pendingConversation = deferred<{ id: number }>();
    chatApi.getConversation.mockReturnValueOnce(pendingConversation.promise);

    const onContact = jest.fn();
    const { result } = await renderReady({ onContact });

    await act(async () => {
      await result.current.selectChapter(7);
    });
    await waitFor(() => expect(result.current.cards).toHaveLength(1));
    await act(async () => {
      await result.current.selectCard(5);
    });

    const item = createOpportunity({
      explorer_id: 9,
      explorer_name: 'Bob',
      opportunities: [{ card: { id: 2, name: 'Card B' } }],
    });

    // First contact is in flight; a second immediate call must be ignored.
    let firstContact!: Promise<void>;
    await act(async () => {
      firstContact = result.current.contact(item);
    });
    await act(async () => {
      await result.current.contact(item);
    });
    expect(chatApi.getConversation).toHaveBeenCalledTimes(1);
    expect(chatApi.getConversation).toHaveBeenCalledWith(
      expect.objectContaining({
        explorerId: 123,
        swapExplorerId: 9,
        cardName: 'Card 5',
      }),
    );

    await act(async () => {
      pendingConversation.resolve({ id: 555 });
      await firstContact;
    });

    expect(onContact).toHaveBeenCalledTimes(1);
    expect(onContact).toHaveBeenCalledWith({
      explorer_id: 9,
      explorer_name: 'Bob',
      opportunities: [{ card: { id: 2, name: 'Card B' } }],
      conversationId: 555,
      cardName: 'Card 5',
    });
  });
});
