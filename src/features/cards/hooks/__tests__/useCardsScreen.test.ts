import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useCardsScreen } from '@/src/features/cards/hooks/useCardsScreen';

// Scope: this file covers only the useCardsScreen logic that the existing
// screen integration test (src/features/cards/tests/Cards.test.tsx) does NOT
// reach — mark-all (bulk + dedup), the derived chaptersData (counts + sort),
// and the duplicated->owned cycle branch. The default->owned->duplicated taps
// and reset-from-owned are already verified end-to-end there, so they are not
// repeated here.

// getToken is created once so its identity is stable; an unstable one would
// re-trigger the fetch effect. useAZIndex is left real (pure, only wired here).
jest.mock('@clerk/clerk-expo', () => {
  const getToken = jest.fn().mockResolvedValue('tkn');
  return { useAuth: () => ({ getToken }) };
});

jest.mock('@/src/features/cards/api/cardsApi', () => ({
  fetchPlaces: jest.fn(),
  fetchCards: jest.fn(),
  fetchCardStatuses: jest.fn(),
  upsertExplorerCard: jest.fn(),
  deleteExplorerCard: jest.fn(),
  setChapterCardsStatus: jest.fn(),
}));

// Typed as bare jest.Mocks (not the real signatures) so resolved values can be
// plain objects: upsert/delete really return AxiosResponse, but the hook only
// reads .status and .data.
const cardsApi = jest.requireMock('@/src/features/cards/api/cardsApi') as {
  fetchPlaces: jest.Mock;
  fetchCards: jest.Mock;
  fetchCardStatuses: jest.Mock;
  upsertExplorerCard: jest.Mock;
  deleteExplorerCard: jest.Mock;
  setChapterCardsStatus: jest.Mock;
};

const CHAPTERS = [
  { id: 1, name: 'Alpha' },
  { id: 2, name: 'Beta' },
];

// cards 10 & 11 live in chapter 1, card 20 in chapter 2.
const CARDS = [
  { id: 10, name: 'C10', number: 1, place_id: 1 },
  { id: 11, name: 'C11', number: 2, place_id: 1 },
  { id: 20, name: 'C20', number: 1, place_id: 2 },
];

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});

  cardsApi.fetchPlaces.mockResolvedValue(CHAPTERS);
  cardsApi.fetchCards.mockResolvedValue(CARDS);
  cardsApi.fetchCardStatuses.mockResolvedValue({});
  cardsApi.upsertExplorerCard.mockResolvedValue({
    status: 200,
    data: { duplicate: false },
  });
  cardsApi.setChapterCardsStatus.mockResolvedValue(undefined);
});

async function setupLoaded(statuses: Record<string, string> = {}) {
  cardsApi.fetchCardStatuses.mockResolvedValue(statuses);
  const view = renderHook(() => useCardsScreen({ explorerId: 1 }));
  await waitFor(() => expect(view.result.current.isLoading).toBe(false));
  return view;
}

describe('onSelectCard (duplicated -> owned branch)', () => {
  // The integration test taps default->owned->duplicated; the wrap back to
  // owned is only reachable here.
  it('upserts a duplicated card back to owned as non-duplicate', async () => {
    const { result } = await setupLoaded({ '10': 'duplicated' });
    cardsApi.upsertExplorerCard.mockResolvedValue({
      status: 200,
      data: { duplicate: false },
    });

    await act(async () => {
      await result.current.onSelectCard(10);
    });

    expect(cardsApi.upsertExplorerCard).toHaveBeenCalledWith(
      expect.objectContaining({ cardId: 10, duplicate: false }),
    );
    expect(result.current.cardStatuses['10']).toBe('owned');
  });
});

describe('mark all', () => {
  it('marks every card in the chapter and leaves other chapters untouched', async () => {
    const { result } = await setupLoaded({});

    await act(async () => {
      await result.current.onMarkAllOwned(1);
    });

    expect(cardsApi.setChapterCardsStatus).toHaveBeenCalledWith(
      expect.objectContaining({ chapterId: 1, status: 'owned' }),
    );
    expect(result.current.cardStatuses['10']).toBe('owned');
    expect(result.current.cardStatuses['11']).toBe('owned');
    expect(result.current.cardStatuses['20']).toBeUndefined(); // chapter 2
  });

  it('marks all duplicated', async () => {
    const { result } = await setupLoaded({});

    await act(async () => {
      await result.current.onMarkAllDuplicated(1);
    });

    expect(cardsApi.setChapterCardsStatus).toHaveBeenCalledWith(
      expect.objectContaining({ chapterId: 1, status: 'duplicated' }),
    );
    expect(result.current.cardStatuses['10']).toBe('duplicated');
  });

  it('dedupes concurrent calls for the same chapter and tracks pending state', async () => {
    const gate = deferred<undefined>();
    cardsApi.setChapterCardsStatus.mockReturnValue(gate.promise);
    const { result } = await setupLoaded({});

    let calls: Promise<void>[] = [];
    await act(async () => {
      calls = [
        result.current.onMarkAllOwned(1),
        result.current.onMarkAllOwned(1),
      ];
      // let the first call's getToken microtask resolve so it reaches the API
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(cardsApi.setChapterCardsStatus).toHaveBeenCalledTimes(1);
    expect(result.current.isChapterPending(1)).toBe(true);

    await act(async () => {
      gate.resolve(undefined);
      await Promise.all(calls);
    });

    expect(result.current.isChapterPending(1)).toBe(false);
    expect(result.current.cardStatuses['10']).toBe('owned');
  });
});

describe('chaptersData', () => {
  it('counts owned/duplicated cards and sorts by name by default', async () => {
    const { result } = await setupLoaded({ '10': 'owned', '20': 'duplicated' });

    const data = result.current.chaptersData;
    expect(data.map((c) => c.chapterName)).toEqual(['Alpha', 'Beta']);

    const ch1 = data.find((c) => c.chapterId === 1)!;
    const ch2 = data.find((c) => c.chapterId === 2)!;
    expect(ch1.ownedOrDuplicatedCount).toBe(1); // card 10 owned, 11 default
    expect(ch2.ownedOrDuplicatedCount).toBe(1); // card 20 duplicated
  });

  it('sorts by most recent chapter id when sortLatest is on', async () => {
    const { result } = await setupLoaded({});

    act(() => result.current.setSortLatest(true));

    expect(result.current.chaptersData.map((c) => c.chapterId)).toEqual([2, 1]);
  });

  // Regression: /cards has no ORDER BY server-side, so it returns rows in
  // physical order — which silently reorders after a row update and made one
  // chapter render "2 1 3 4 5 6 7 8 9". The shape below mirrors what the live
  // API actually returned for that chapter.
  it('orders each chapter by card number regardless of API row order', async () => {
    cardsApi.fetchCards.mockResolvedValue([
      { id: 74, name: 'C2', number: 2, place_id: 1 },
      { id: 73, name: 'C1', number: 1, place_id: 1 },
      { id: 75, name: 'C3', number: 3, place_id: 1 },
      { id: 20, name: 'C20', number: 1, place_id: 2 },
    ]);

    const { result } = await setupLoaded({});

    const ch1 = result.current.chaptersData.find((c) => c.chapterId === 1)!;
    expect(ch1.cards.map((c) => c.number)).toEqual([1, 2, 3]);
  });
});
