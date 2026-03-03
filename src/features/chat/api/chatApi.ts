import { axiosInstance } from '@/src/lib/axiosInstance';
import type { Message } from '@/src/features/chat/types/MessageType';
import type { ConversationStatus } from '@/src/features/chat/types/ConversationStatus';

type AuthHeaders = Record<string, string>;

type GetAllMessagesArgs = {
  conversationId: number;
  headers: AuthHeaders;
};

type MarkConversationReadArgs = {
  conversationId: number;
  explorerId: number;
  headers: AuthHeaders;
};

type PostMessagePayload = {
  content: string;
  timestamp: string;
  sender_id: number;
  recipient_id: number;
  conversation_id: number;
};

type PostMessageArgs = {
  conversationId: number;
  headers: AuthHeaders;
  payload: PostMessagePayload;
};

type UpdateConversationStatusArgs = {
  conversationId: number;
  headers: AuthHeaders;
  status: ConversationStatus;
};

export async function getAllMessages({
  conversationId,
  headers,
}: GetAllMessagesArgs) {
  const resp = await axiosInstance.get(`/chat/${conversationId}`, {
    headers,
    timeout: 20000,
  });

  return {
    allMessages: (resp.data?.allMessages ?? []) as Message[],
    conversationStatus: (resp.data?.conversationStatus ??
      null) as ConversationStatus | null,
  };
}

export async function markConversationRead({
  conversationId,
  explorerId,
  headers,
}: MarkConversationReadArgs) {
  await axiosInstance.put(
    `/conversation/${conversationId}/${explorerId}`,
    {},
    { headers, timeout: 20000 },
  );
}

export async function postMessage({
  conversationId,
  headers,
  payload,
}: PostMessageArgs) {
  await axiosInstance.post(`/chat/${conversationId}`, payload, {
    headers,
    timeout: 20000,
  });
}

export async function updateConversationStatus({
  conversationId,
  headers,
  status,
}: UpdateConversationStatusArgs) {
  await axiosInstance.put(
    `/conversation/${conversationId}`,
    { status },
    { headers, timeout: 20000 },
  );
}
