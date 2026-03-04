export type TabKey = 'in-progress' | 'past';

export type ConversationStatus = 'Completed' | 'Declined' | 'In progress';

export type DashboardConversation = {
  db_id: number;
  card_name: string;
  swap_explorer: string;
  swap_explorer_id: number;
  status: ConversationStatus;
  creator_id: number;
  recipient_id: number;
  unread: number;
  last_message_at: string | null;
};

export type DashboardItemData = DashboardConversation;

export type PastCursor = {
  cursor_unread: 0 | 1;
  cursor_card: string;
  cursor_swap: string;
  cursor_id: number;
};

export type PastCursorResponse = {
  conversations: DashboardConversation[];
  hasMore: boolean;
  nextCursor: PastCursor | null;
};

export const PAST_PAGE_SIZE = 30;
