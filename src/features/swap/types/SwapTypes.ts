export type SwapChapter = {
  id: number;
  name: string;
};

export type SwapCard = {
  id: number;
  name: string;
  number: number;
};

export type SwapOpportunityCardRef = {
  id: number;
  name: string;
};

export type SwapExplorerOpportunity = {
  card: SwapOpportunityCardRef;
};

/**
 * Represents one row in the opportunities list (an explorer who can swap).
 * Field names keep backend/web snake_case.
 */
export type SwapOpportunityItem = {
  explorer_id: number;
  explorer_name: string;
  last_active_at?: string | null;
  opportunities: SwapExplorerOpportunity[];
};

export type SwapPagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
};

export type SwapOpportunitiesResponse = {
  items: SwapOpportunityItem[];
  pagination: SwapPagination;
};

export type SwapContactPayload = {
  explorer_id: number;
  explorer_name: string;
  opportunities: SwapExplorerOpportunity[];
  conversationId: number;
  cardName: string;
};

export type SwapErrorCode =
  | 'chapters_fetch_failed'
  | 'cards_fetch_failed'
  | 'opportunities_fetch_failed'
  | 'contact_failed'
  | 'sign_in_required';

export type SwapError = {
  code: SwapErrorCode;
  message: string;
};
