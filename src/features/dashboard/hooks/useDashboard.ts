import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import {
  fetchInProgressConversations,
  fetchPastFirstPage,
  fetchPastNextPage,
  updateConversationStatus,
} from '@/src/features/dashboard/api/dashboardApi';

import {
  PAST_PAGE_SIZE,
  type DashboardConversation,
  type PastCursor,
  type TabKey,
} from '@/src/features/dashboard/types/DashboardTypes';

import { useUiUnreadOverrides } from '@/src/features/dashboard/hooks/useUiUnreadOverrides';

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

  const { isUnread, setUiUnread } = useUiUnreadOverrides();

  const loadMoreLockRef = useRef(false);

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

  const setStatusLocal = useCallback(
    (conversationId: number, status: DashboardConversation['status']) => {
      setInProgress((prev) =>
        prev.map((c) => (c.db_id === conversationId ? { ...c, status } : c)),
      );
      setPast((prev) =>
        prev.map((c) => (c.db_id === conversationId ? { ...c, status } : c)),
      );
    },
    [],
  );

  const setConversationStatus = useCallback(
    async (conversationId: number, status: DashboardConversation['status']) => {
      try {
        const headers = await authHeaders();
        await updateConversationStatus({ conversationId, status, headers });
        setStatusLocal(conversationId, status);
      } catch {
        // keep same "silent failure" style as other calls in this file
      }
    },
    [authHeaders, setStatusLocal],
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
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
  }, [activeTab, fetchInProgress, fetchPastFirst]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoadingInitial(true);
      try {
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
  }, [activeTab, fetchInProgress, fetchPastFirst]);

  useEffect(() => {
    loadMoreLockRef.current = false;
    setLoadingMore(false);
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
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
    }, [activeTab, fetchInProgress, fetchPastFirst]),
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
  };
}
