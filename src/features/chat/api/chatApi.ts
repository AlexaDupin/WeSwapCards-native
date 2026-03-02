import { axiosInstance } from '@/src/lib/axiosInstance';
import type { Message } from '@/src/features/chat/types/MessageType';

export async function getAllMessages(args: {
  conversationId: number;
  headers: Record<string, string>;
}) {
  const resp = await axiosInstance.get(`/chat/${args.conversationId}`, {
    headers: args.headers,
    timeout: 20000,
  });

  return (resp.data?.allMessages ?? []) as Message[];
}

export async function markConversationRead(args: {
  conversationId: number;
  explorerId: number;
  headers: Record<string, string>;
}) {
  await axiosInstance.put(
    `/conversation/${args.conversationId}/${args.explorerId}`,
    {},
    { headers: args.headers, timeout: 20000 },
  );
}

export async function postMessage(args: {
  conversationId: number;
  headers: Record<string, string>;
  payload: {
    content: string;
    timestamp: string;
    sender_id: number;
    recipient_id: number;
    conversation_id: number;
  };
}) {
  await axiosInstance.post(`/chat/${args.conversationId}`, args.payload, {
    headers: args.headers,
    timeout: 20000,
  });
}
