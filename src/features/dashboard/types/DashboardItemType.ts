export type ConversationStatus = 'Completed' | 'Declined' | 'In progress';

export interface DashboardItemData {
  row_id: string;
  db_id: number;
  card_name: string;
  swap_explorer: string;
  swap_explorer_id: number;
  status: ConversationStatus;
  creator_id: number;
  recipient_id: number;
  unread: string;
  last_message_at: string | null;
}
