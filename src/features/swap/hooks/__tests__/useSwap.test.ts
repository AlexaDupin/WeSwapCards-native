import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useSwap } from '@/src/features/swap/hooks/useSwap';
import type {
  SwapOpportunitiesResponse,
  SwapOpportunityItem,
} from '@/src/features/swap/types/SwapTypes';

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

// ---- Typed mocked module access ----

const swapApi = jest.requireMock(
  '@/src/features/swap/api/swapApi',
) as jest.Mocked<typeof import('@/src/features/swap/api/swapApi')>;

// ---- Factories ----

function createOpportunity(
  overrides: Partial<SwapOpportunityItem> = {},
): SwapOpportunityItem {
  return {
    explorer_id: 1,
    explorer_name: 'Mock Explorer',
    last_active_at: '2026-03-12T12:00:00.000Z',
    opportunities: [],
    ...overrides,
  };
}

function createPage(
  items: SwapOpportunityItem[],
  page: number,
  totalPages: number,
): SwapOpportunitiesResponse {
  return {
    items,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalPages * 20,
      itemsPerPage: 20,
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  swapApi.fetchChapters.mockResolvedValue([]);
  swapApi.fetchLatestChapters.mockResolvedValue([]);
  swapApi.fetchCardsForChapter.mockResolvedValue([]);
});

describe('useSwap', () => {
  it('deduplicates overlapping explorers when loading more opportunity pages', async () => {
    // Page 2 overlaps page 1 on explorer_id 2 — the row drifted past the page
    // boundary between fetches (offset pagination over a volatile sort).
    swapApi.fetchSwapOpportunities
      .mockResolvedValueOnce(
        createPage(
          [
            createOpportunity({ explorer_id: 1 }),
            createOpportunity({ explorer_id: 2 }),
          ],
          1,
          2,
        ),
      )
      .mockResolvedValueOnce(
        createPage(
          [
            createOpportunity({ explorer_id: 2 }),
            createOpportunity({ explorer_id: 3 }),
          ],
          2,
          2,
        ),
      );

    const { result } = renderHook(() => useSwap());

    await waitFor(() => {
      expect(result.current.loadingChapters).toBe(false);
    });

    await act(async () => {
      await result.current.selectCard(1);
    });

    await waitFor(() => {
      expect(result.current.opportunities.map((o) => o.explorer_id)).toEqual([
        1, 2,
      ]);
    });

    await act(async () => {
      await result.current.loadMoreOpportunities();
    });

    await waitFor(() => {
      expect(result.current.opportunities.map((o) => o.explorer_id)).toEqual([
        1, 2, 3,
      ]);
    });
  });
});
