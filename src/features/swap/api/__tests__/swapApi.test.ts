import {
  fetchCardsForChapter,
  fetchChapters,
  fetchLatestChapters,
  fetchSwapOpportunities,
} from '@/src/features/swap/api/swapApi';
import {
  createCard,
  createChapter,
  createOpportunitiesPage,
  createOpportunity,
} from '@/src/features/swap/testFixtures';

// Mock only the network boundary. These tests lock down the request contract
// (URL + params/headers) and the response unwrapping that the integration
// tests deliberately mock away.
jest.mock('@/src/lib/axiosInstance', () => ({
  axiosInstance: { get: jest.fn() },
}));

const { axiosInstance } = jest.requireMock('@/src/lib/axiosInstance') as {
  axiosInstance: { get: jest.Mock };
};

const get = axiosInstance.get;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('fetchChapters', () => {
  it('requests /places and unwraps data.places', async () => {
    const chapters = [createChapter({ id: 1 }), createChapter({ id: 2 })];
    get.mockResolvedValue({ data: { places: chapters } });

    await expect(fetchChapters()).resolves.toEqual(chapters);
    expect(get).toHaveBeenCalledWith('/places', undefined);
  });

  it('forwards auth headers when provided', async () => {
    get.mockResolvedValue({ data: { places: [] } });

    await fetchChapters({ headers: { Authorization: 'Bearer t' } });

    expect(get).toHaveBeenCalledWith('/places', {
      headers: { Authorization: 'Bearer t' },
    });
  });

  it('falls back to [] when places is missing', async () => {
    get.mockResolvedValue({ data: {} });

    await expect(fetchChapters()).resolves.toEqual([]);
  });
});

describe('fetchLatestChapters', () => {
  it('requests /chapters/latest and unwraps data.items', async () => {
    const items = [createChapter({ id: 3 })];
    get.mockResolvedValue({ data: { items } });

    await expect(fetchLatestChapters()).resolves.toEqual(items);
    expect(get).toHaveBeenCalledWith('/chapters/latest', {});
  });

  it('passes limit as a query param and forwards headers', async () => {
    get.mockResolvedValue({ data: { items: [] } });

    await fetchLatestChapters({
      headers: { Authorization: 'Bearer t' },
      limit: 5,
    });

    expect(get).toHaveBeenCalledWith('/chapters/latest', {
      headers: { Authorization: 'Bearer t' },
      params: { limit: 5 },
    });
  });

  it('falls back to [] when items is missing', async () => {
    get.mockResolvedValue({ data: {} });

    await expect(fetchLatestChapters()).resolves.toEqual([]);
  });
});

describe('fetchCardsForChapter', () => {
  it('requests /cards/:chapterId and unwraps data.cards', async () => {
    const cards = [createCard({ id: 5 })];
    get.mockResolvedValue({ data: { cards } });

    await expect(fetchCardsForChapter({ chapterId: 42 })).resolves.toEqual(
      cards,
    );
    expect(get).toHaveBeenCalledWith('/cards/42', undefined);
  });

  it('forwards auth headers when provided', async () => {
    get.mockResolvedValue({ data: { cards: [] } });

    await fetchCardsForChapter({
      chapterId: 42,
      headers: { Authorization: 'Bearer t' },
    });

    expect(get).toHaveBeenCalledWith('/cards/42', {
      headers: { Authorization: 'Bearer t' },
    });
  });

  it('falls back to [] when cards is missing', async () => {
    get.mockResolvedValue({ data: {} });

    await expect(fetchCardsForChapter({ chapterId: 42 })).resolves.toEqual([]);
  });
});

describe('fetchSwapOpportunities', () => {
  it('requests the explorer/card endpoint with paging and headers, returning the raw page', async () => {
    const page = createOpportunitiesPage(
      [createOpportunity({ explorer_id: 9, explorer_name: 'Bob' })],
      1,
      3,
    );
    get.mockResolvedValue({ data: page });

    const result = await fetchSwapOpportunities({
      explorerId: 9,
      cardId: 5,
      page: 1,
      limit: 20,
      headers: { Authorization: 'Bearer t' },
    });

    expect(result).toEqual(page);
    expect(get).toHaveBeenCalledWith('/opportunities/9/card/5', {
      headers: { Authorization: 'Bearer t' },
      params: { page: 1, limit: 20 },
    });
  });
});
