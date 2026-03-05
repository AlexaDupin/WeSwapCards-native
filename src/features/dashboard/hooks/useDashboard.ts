import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import {
  fetchInProgressConversations,
  fetchPastFirstPage,
  fetchPastNextPage,
  updateConversationStatus,
  getUnreadCounts,
  markConversationUnread,
} from '@/src/features/dashboard/api/dashboardApi';

import {
  PAST_PAGE_SIZE,
  type DashboardConversation,
  type PastCursor,
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

export function useDashboard(args: UseDashboardArgs) {
  const { explorerId, authHeaders } = args;

  const [activeTab, setActiveTab] = useState<TabKey>('in-progress');

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

  const fetchInProgress = useCallback(async () => {
    const headers = await authHeaders();
    return fetchInProgressConversations({ explorerId, headers });
  }, [authHeaders, explorerId]);

  const fetchPastFirst = useCallback(async () => {
    const headers = await authHeaders();
    return fetchPastFirstPage({
      explorerId,
      headers,
      pageSize: PAST_PAGE_SIZE,
    });
  }, [authHeaders, explorerId]);

  const fetchPastNext = useCallback(
    async (cursor: PastCursor) => {
      const headers = await authHeaders();
      return fetchPastNextPage({
        explorerId,
        headers,
        pageSize: PAST_PAGE_SIZE,
        cursor,
      });
    },
    [authHeaders, explorerId],
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
        const data = await fetchPastFirst();
        setPast(data.conversations);
        setPastHasMore(Boolean(data.hasMore));
        setPastCursor(data.nextCursor);
      }
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, fetchInProgress, fetchPastFirst, refreshUnreadCounts]);

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
          const data = await fetchPastFirst();
          if (!cancelled) {
            setPast(data.conversations);
            setPastHasMore(Boolean(data.hasMore));
            setPastCursor(data.nextCursor);
          }
        }
      } finally {
        if (!cancelled) setLoadingInitial(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab, fetchInProgress, fetchPastFirst, refreshUnreadCounts]);

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
        fetchPastFirst()
          .then((data) => {
            setPast(data.conversations);
            setPastHasMore(Boolean(data.hasMore));
            setPastCursor(data.nextCursor);
          })
          .catch(() => {});
      }
    }, [activeTab, fetchInProgress, fetchPastFirst, refreshUnreadCounts]),
  );

  const loadMorePast = useCallback(async () => {
    if (activeTab !== 'past') return;
    if (!pastHasMore || !pastCursor) return;
    if (loadingMore) return;
    if (loadMoreLockRef.current) return;

    loadMoreLockRef.current = true;
    setLoadingMore(true);

    try {
      const data = await fetchPastNext(pastCursor);
      setPast((prev) => [...prev, ...data.conversations]);
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
  };
}
