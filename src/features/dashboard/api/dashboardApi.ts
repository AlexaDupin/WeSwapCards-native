import { axiosInstance } from '@/src/lib/axiosInstance';
import type {
  DashboardConversation,
  PastCursor,
  PastCursorResponse,
  SortKey,
} from '@/src/features/dashboard/types/DashboardTypes';

type AuthHeaders = Record<string, string>;

// `search`/`sort` are optional with backend-compatible defaults so existing
// callers behave exactly as before.
function filterQuery(search = '', sort: SortKey = 'date') {
  let qs = `&sort=${sort}`;
  if (search.trim()) qs += `&search=${encodeURIComponent(search.trim())}`;
  return qs;
}

// Sort In Progress conversations by recency only (no unread priority), matching
// the server's date tiebreakers: newest first, nulls last, db_id desc. The
// shared backend pins unread on top for `sort=date`; mobile re-sorts to drop
// that so ordering is purely by date (web keeps the server ordering).
function sortByDate(list: DashboardConversation[]): DashboardConversation[] {
  return [...list].sort((a, b) => {
    const ta = a.last_message_at ? Date.parse(a.last_message_at) : null;
    const tb = b.last_message_at ? Date.parse(b.last_message_at) : null;
    if (ta !== tb) {
      if (ta === null) return 1; // nulls last
      if (tb === null) return -1;
      return tb - ta; // newest first
    }
    return b.db_id - a.db_id; // stable tiebreak, newest id first
  });
}

export async function fetchInProgressConversations(args: {
  explorerId: number | null;
  headers: AuthHeaders;
  search?: string;
  sort?: SortKey;
}) {
  const { explorerId, headers, search, sort } = args;

  const resp = await axiosInstance.get(
    `/conversation/${explorerId}?page=1&limit=40${filterQuery(search, sort)}`,
    { headers },
  );

  const list: DashboardConversation[] = resp.data.conversations ?? [];
  // Re-sort the date view client-side so unread conversations aren't pinned on
  // top (mobile-only). The `name` sort is already plain alphabetical server-side.
  return (sort ?? 'date') === 'date' ? sortByDate(list) : list;
}

export async function fetchPastFirstPage(args: {
  explorerId: number | null;
  headers: AuthHeaders;
  pageSize: number;
  search?: string;
  sort?: SortKey;
}) {
  const { explorerId, headers, pageSize, search, sort } = args;

  const resp = await axiosInstance.get<PastCursorResponse>(
    `/conversation/past/${explorerId}?mode=cursor&limit=${pageSize}` +
      filterQuery(search, sort),
    { headers, timeout: 20000 },
  );

  return resp.data;
}

export async function fetchPastNextPage(args: {
  explorerId: number | null;
  headers: AuthHeaders;
  pageSize: number;
  cursor: PastCursor;
  search?: string;
  sort?: SortKey;
}) {
  const { explorerId, headers, pageSize, cursor, search, sort } = args;

  // Send the cursor field that matches the active sort so the server's keyset
  // predicate lines up with its ORDER BY.
  const cursorQs =
    'cursor_card_name' in cursor
      ? `&cursor_card_name=${encodeURIComponent(cursor.cursor_card_name ?? '')}`
      : `&cursor_last_message_at=${encodeURIComponent(
          cursor.cursor_last_message_at ?? '',
        )}`;

  const qs =
    `mode=cursor&limit=${pageSize}` +
    filterQuery(search, sort) +
    cursorQs +
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

export async function updateExplorerActivity(args: {
  explorerId: number;
  headers: AuthHeaders;
}): Promise<void> {
  const { explorerId, headers } = args;
  await axiosInstance.post(
    `/exploreractivity/${explorerId}`,
    {},
    {
      headers,
      timeout: 10000,
    },
  );
}
