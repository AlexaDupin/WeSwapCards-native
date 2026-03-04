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

  const qs =
    `mode=cursor&limit=${pageSize}` +
    `&cursor_unread=${cursor.cursor_unread}` +
    `&cursor_card=${encodeURIComponent(cursor.cursor_card)}` +
    `&cursor_swap=${encodeURIComponent(cursor.cursor_swap)}` +
    `&cursor_id=${cursor.cursor_id}`;

  const resp = await axiosInstance.get<PastCursorResponse>(
    `/conversation/past/${explorerId}?${qs}`,
    { headers, timeout: 20000 },
  );

  return resp.data;
}
