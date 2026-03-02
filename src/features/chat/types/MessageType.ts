export type Message = {
  id: number;
  content: string;
  timestamp: string;
  sender_id: number;
  recipient_id: number;
  conversation_id: number;
  read?: boolean;
};
