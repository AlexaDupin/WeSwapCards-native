import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import {
  fetchInProgressConversations,
  fetchPastFirstPage,
  fetchPastNextPage,
  updateConversationStatus,
  getUnreadCounts,
  markConversationUnread,
  updateExplorerActivity,
} from '@/src/features/dashboard/api/dashboardApi';

import {
  PAST_PAGE_SIZE,
  type DashboardConversation,
  type PastCursor,
  type SortKey,
  type TabKey,
} from '@/src/features/dashboard/types/DashboardTypes';

import { useUiUnreadOverrides } from '@/src/features/dashboard/hooks/useUiUnreadOverrides';
import { ConversationStatus } from '../../chat/types/ConversationStatus';

type UnreadCounts = {
  inProgress: number;
  past: number;
};

type UseDashboardArgs = {
  explorerId: number | null;
  authHeaders: () => Promise<Record<string, string>>;
};

// Appends a fetched page while dropping any conversation already in the list.
// Guards against duplicate keys when a page overlaps what we already have
// (e.g. rows shifting between pages, or a stale page landing after a reset).
function appendUniquePast(
  prev: DashboardConversation[],
  next: DashboardConversation[],
): DashboardConversation[] {
  const seen = new Set(prev.map((c) => c.db_id));
  const additions = next.filter((c) => !seen.has(c.db_id));
  return additions.length ? [...prev, ...additions] : prev;
}

export function useDashboard(args: UseDashboardArgs) {
  const { explorerId, authHeaders } = args;

  const [activeTab, setActiveTab] = useState<TabKey>('in-progress');

  // Search/sort run server-side. `debouncedSearch` is what actually hits the API.
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const [inProgress, setInProgress] = useState<DashboardConversation[]>([]);
  const [past, setPast] = useState<DashboardConversation[]>([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [pastHasMore, setPastHasMore] = useState(false);
  const [pastCursor, setPastCursor] = useState<PastCursor | null>(null);

  const { isUnread, setUiUnread: setUiUnreadBase } = useUiUnreadOverrides();

  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    inProgress: 0,
    past: 0,
  });

  const loadMoreLockRef = useRef(false);
  const inProgressRef = useRef(inProgress);
  const pastRef = useRef(past);

  // Bumped every time the past list is reset to a fresh first page. An in-flight
  // loadMore captures the value at its start and discards its result if the
  // generation changed (sort/search/tab switch, refresh) while it was fetching.
  const pastGenRef = useRef(0);

  useEffect(() => {
    inProgressRef.current = inProgress;
  }, [inProgress]);

  useEffect(() => {
    pastRef.current = past;
  }, [past]);

  const upsertPastAtTop = (
    prev: DashboardConversation[],
    nextItem: DashboardConversation,
  ) => {
    const without = prev.filter((c) => c.db_id !== nextItem.db_id);
    return [nextItem, ...without];
  };

  // These callbacks carry the active search/sort, so when either changes their
  // identity changes and the fetch effects below re-run (refetch + cursor reset).
  const fetchInProgress = useCallback(async () => {
    const headers = await authHeaders();
    return fetchInProgressConversations({
      explorerId,
      headers,
      search: debouncedSearch,
      sort: sortBy,
    });
  }, [authHeaders, explorerId, debouncedSearch, sortBy]);

  const fetchPastFirst = useCallback(async () => {
    const headers = await authHeaders();
    return fetchPastFirstPage({
      explorerId,
      headers,
      pageSize: PAST_PAGE_SIZE,
      search: debouncedSearch,
      sort: sortBy,
    });
  }, [authHeaders, explorerId, debouncedSearch, sortBy]);

  const fetchPastNext = useCallback(
    async (cursor: PastCursor) => {
      const headers = await authHeaders();
      return fetchPastNextPage({
        explorerId,
        headers,
        pageSize: PAST_PAGE_SIZE,
        cursor,
        search: debouncedSearch,
        sort: sortBy,
      });
    },
    [authHeaders, explorerId, debouncedSearch, sortBy],
  );

  const refreshUnreadCounts = useCallback(async () => {
    if (!explorerId) return;

    const headers = await authHeaders();
    const counts = await getUnreadCounts({ explorerId, headers });

    setUnreadCounts({
      inProgress: Number(counts.inProgress ?? 0),
      past: Number(counts.past ?? 0),
    });
  }, [authHeaders, explorerId]);

  // Loads (or reloads) the first past page as one atomic reset: bump the
  // generation, clear the cursor synchronously so a concurrent loadMore can't
  // page off a stale cursor, then apply the result only if still current.
  const loadPastFirstPage = useCallback(async () => {
    const gen = ++pastGenRef.current;
    setPastCursor(null);
    setPastHasMore(false);

    const data = await fetchPastFirst();
    if (gen !== pastGenRef.current) return;

    setPast(data.conversations);
    setPastHasMore(Boolean(data.hasMore));
    setPastCursor(data.nextCursor);
  }, [fetchPastFirst]);

  const setUiUnread = useCallback(
    async (conversationId: number, next: boolean) => {
      const item =
        inProgressRef.current.find((c) => c.db_id === conversationId) ??
        pastRef.current.find((c) => c.db_id === conversationId);

      setUiUnreadBase(conversationId, next);

      if (!item) return;
      if (!next) return;

      try {
        if (!explorerId) return;

        const headers = await authHeaders();
        const result = await markConversationUnread({
          conversationId,
          explorerId,
          headers,
        });

        if (!result.unread) {
          setUiUnreadBase(conversationId, false);
          return;
        }

        const patchUnread = (c: DashboardConversation) =>
          c.db_id === conversationId ? { ...c, unread: 1 } : c;

        setInProgress((prev) => prev.map(patchUnread));
        setPast((prev) => prev.map(patchUnread));

        await refreshUnreadCounts();
      } catch {
        setUiUnreadBase(conversationId, false);
      }
    },
    [authHeaders, explorerId, refreshUnreadCounts, setUiUnreadBase],
  );

  const applyStatusLocal = useCallback(
    (conversationId: number, nextStatus: ConversationStatus) => {
      const isInPast = pastRef.current.some((c) => c.db_id === conversationId);
      if (isInPast) {
        setPast((prevPast) =>
          prevPast.map((c) =>
            c.db_id === conversationId ? { ...c, status: nextStatus } : c,
          ),
        );
        return;
      }

      const found = inProgressRef.current.find(
        (c) => c.db_id === conversationId,
      );
      if (!found) return;

      if (nextStatus === 'Completed' || nextStatus === 'Declined') {
        const moved: DashboardConversation = { ...found, status: nextStatus };
        setInProgress((prevIn) =>
          prevIn.filter((c) => c.db_id !== conversationId),
        );
        setPast((prevPast) => upsertPastAtTop(prevPast, moved));
        return;
      }

      setInProgress((prevIn) =>
        prevIn.map((c) =>
          c.db_id === conversationId ? { ...c, status: nextStatus } : c,
        ),
      );
    },
    [],
  );

  const setConversationStatus = useCallback(
    async (conversationId: number, status: ConversationStatus) => {
      try {
        const headers = await authHeaders();
        await updateConversationStatus({ conversationId, status, headers });

        applyStatusLocal(conversationId, status);

        await refreshUnreadCounts();
      } catch {}
    },
    [authHeaders, applyStatusLocal, refreshUnreadCounts],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUnreadCounts();

      if (activeTab === 'in-progress') {
        const list = await fetchInProgress();
        setInProgress(list);
      } else {
        await loadPastFirstPage();
      }
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, fetchInProgress, loadPastFirstPage, refreshUnreadCounts]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingInitial(true);
      try {
        await refreshUnreadCounts();

        if (activeTab === 'in-progress') {
          const list = await fetchInProgress();
          if (!cancelled) setInProgress(list);
        } else {
          await loadPastFirstPage();
        }
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab, fetchInProgress, loadPastFirstPage, refreshUnreadCounts]);

  useEffect(() => {
    loadMoreLockRef.current = false;
    setLoadingMore(false);
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      refreshUnreadCounts().catch(() => {});

      if (activeTab === 'in-progress') {
        fetchInProgress()
          .then(setInProgress)
          .catch(() => {});
      } else {
        loadPastFirstPage().catch(() => {});
      }
    }, [activeTab, fetchInProgress, loadPastFirstPage, refreshUnreadCounts]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!explorerId) return;
      authHeaders()
        .then((headers) => updateExplorerActivity({ explorerId, headers }))
        .catch(() => {});
    }, [explorerId, authHeaders]),
  );

  const loadMorePast = useCallback(async () => {
    if (activeTab !== 'past') return;
    if (!pastHasMore || !pastCursor) return;
    if (loadingMore) return;
    if (loadMoreLockRef.current) return;

    const gen = pastGenRef.current;
    loadMoreLockRef.current = true;
    setLoadingMore(true);

    try {
      const data = await fetchPastNext(pastCursor);
      // The list was reset to a fresh first page (sort/search/tab switch or
      // refresh) while we were fetching: drop this now-stale page rather than
      // appending it onto a different query's results.
      if (gen !== pastGenRef.current) return;

      setPast((prev) => appendUniquePast(prev, data.conversations));
      setPastHasMore(Boolean(data.hasMore));
      setPastCursor(data.nextCursor);
    } finally {
      setLoadingMore(false);
      loadMoreLockRef.current = false;
    }
  }, [activeTab, pastHasMore, pastCursor, loadingMore, fetchPastNext]);

  const listData = useMemo(
    () => (activeTab === 'in-progress' ? inProgress : past),
    [activeTab, inProgress, past],
  );

  return {
    activeTab,
    setActiveTab,
    listData,
    loadingInitial,
    refreshing,
    loadingMore,
    onRefresh,
    loadMorePast,
    isUnread,
    setUiUnread,
    setConversationStatus,
    unreadCounts,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  };
}
