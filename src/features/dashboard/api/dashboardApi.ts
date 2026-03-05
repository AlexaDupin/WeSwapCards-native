import { axiosInstance } from '@/src/lib/axiosInstance';
import type {
  PastCursor,
  PastCursorResponse,
} from '@/src/features/dashboard/types/DashboardTypes';

type AuthHeaders = Record<string, string>;

export async function fetchInProgressConversations(args: {
  explorerId: number | null;
  headers: AuthHeaders;
}) {
  const { explorerId, headers } = args;

  const resp = await axiosInstance.get(
    `/conversation/${explorerId}?page=1&limit=40`,
    { headers },
  );

  return resp.data.conversations ?? [];
}

export async function fetchPastFirstPage(args: {
  explorerId: number | null;
  headers: AuthHeaders;
  pageSize: number;
}) {
  const { explorerId, headers, pageSize } = args;

  const resp = await axiosInstance.get<PastCursorResponse>(
    `/conversation/past/${explorerId}?mode=cursor&limit=${pageSize}`,
    { headers, timeout: 20000 },
  );

  return resp.data;
}

export async function fetchPastNextPage(args: {
  explorerId: number | null;
  headers: AuthHeaders;
  pageSize: number;
  cursor: PastCursor;
}) {
  const { explorerId, headers, pageSize, cursor } = args;
  const lastMessageAt = cursor.cursor_last_message_at ?? '';

  const qs =
    `mode=cursor&limit=${pageSize}` +
    `&cursor_last_message_at=${encodeURIComponent(lastMessageAt)}` +
    `&cursor_id=${cursor.cursor_id}`;

  const resp = await axiosInstance.get<PastCursorResponse>(
    `/conversation/past/${explorerId}?${qs}`,
    { headers, timeout: 20000 },
  );

  return resp.data;
}

export async function updateConversationStatus(args: {
  conversationId: number;
  status: 'Completed' | 'Declined' | 'In progress';
  headers: AuthHeaders;
}) {
  const { conversationId, status, headers } = args;

  const resp = await axiosInstance.put(
    `/conversation/${conversationId}`,
    { status },
    { headers },
  );

  return resp.data;
}

export async function getUnreadCounts(args: {
  explorerId: number;
  headers: Record<string, string>;
}) {
  const { explorerId, headers } = args;

  const resp = await axiosInstance.get(`/conversation/unread/${explorerId}`, {
    headers,
  });

  return {
    inProgress: Number(resp.data?.inProgress ?? 0),
    past: Number(resp.data?.past ?? 0),
  };
}

export async function markConversationUnread(args: {
  conversationId: number;
  explorerId: number;
  headers: AuthHeaders;
}) {
  const { conversationId, explorerId, headers } = args;

  const resp = await axiosInstance.put(
    `/conversation/${conversationId}/${explorerId}/unread`,
    {},
    { headers },
  );

  return {
    unread: Boolean(resp.data?.unread),
  };
}
