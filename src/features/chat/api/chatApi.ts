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

type GetConversationArgs = {
  explorerId: number;
  swapExplorerId: number;
  cardName: string;
  headers: AuthHeaders;
};

type ConversationRow = { id: number };

type CreateConversationArgs = {
  explorerId: number;
  swapExplorerId: number;
  cardName: string;
  headers: AuthHeaders;
};

/**
 * GET /conversation/:explorerId/:swapExplorerId/:swapCardName
 *
 * Returns the existing conversation row on 200.
 * Returns null on 204 (no conversation found for this pair + card).
 * Throws on auth failures, network errors, or server errors — callers
 * must not fall through to createConversation in those cases.
 */
export async function getConversation({
  explorerId,
  swapExplorerId,
  cardName,
  headers,
}: GetConversationArgs): Promise<ConversationRow | null> {
  const resp = await axiosInstance.get(
    `/conversation/${explorerId}/${swapExplorerId}/${encodeURIComponent(cardName)}`,
    { headers, timeout: 20000 },
  );
  // 204 means no conversation exists yet for this pair + card
  if (resp.status === 204 || !resp.data) return null;
  return resp.data as ConversationRow;
}

/**
 * POST /conversation/:explorerId/:swapExplorerId/:swapCardName
 *
 * Creates a new conversation. Not idempotent — always inserts a new row.
 * Only call when getConversation() has returned null.
 */
export async function createConversation({
  explorerId,
  swapExplorerId,
  cardName,
  headers,
}: CreateConversationArgs): Promise<ConversationRow> {
  const resp = await axiosInstance.post(
    `/conversation/${explorerId}/${swapExplorerId}/${encodeURIComponent(cardName)}`,
    {
      creator_id: explorerId,
      recipient_id: swapExplorerId,
      card_name: cardName,
      timestamp: new Date().toISOString(),
    },
    { headers, timeout: 20000 },
  );
  return resp.data as ConversationRow;
}
