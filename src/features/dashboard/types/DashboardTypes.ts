export type TabKey = 'in-progress' | 'past';

export type ConversationStatus = 'Completed' | 'Declined' | 'In progress';

export type DashboardConversation = {
  db_id: number;
  card_name: string;
  swap_explorer: string;
  swap_explorer_id: number;
  // Partner avatar resolved from Clerk on the backend (only when they uploaded
  // one). Optional/nullable: absent on paged/older responses, null when the
  // partner has no image.
  swap_explorer_image?: string | null;
  status: ConversationStatus;
  creator_id: number;
  recipient_id: number;
  unread: number;
  last_message_at: string | null;
};

export type DashboardItemData = DashboardConversation;

export type SortKey = 'date' | 'name';

// The cursor's primary field tracks the active sort: timestamp for date, lowered
// card name for name. `cursor_id` is the stable tie-breaker in both cases.
export type PastCursor =
  | { cursor_last_message_at: string; cursor_id: number }
  | { cursor_card_name: string; cursor_id: number };

export type PastCursorResponse = {
  conversations: DashboardConversation[];
  hasMore: boolean;
  nextCursor: PastCursor | null;
};

export const PAST_PAGE_SIZE = 30;
