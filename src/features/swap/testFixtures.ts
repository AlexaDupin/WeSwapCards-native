// Shared factories for swap tests (hook + component). Kept outside any
// `__tests__/` directory so jest does not treat it as a test suite.
import type {
  SwapCard,
  SwapChapter,
  SwapOpportunitiesResponse,
  SwapOpportunityItem,
} from '@/src/features/swap/types/SwapTypes';

export function createChapter(
  overrides: Partial<SwapChapter> = {},
): SwapChapter {
  return { id: 1, name: 'Chapter 1', ...overrides };
}

export function createCard(overrides: Partial<SwapCard> = {}): SwapCard {
  return { id: 5, name: 'Card 5', number: 5, ...overrides };
}

export function createOpportunity(
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

export function createOpportunitiesPage(
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
