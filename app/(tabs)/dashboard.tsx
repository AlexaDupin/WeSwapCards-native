import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

import Pill from '@/src/components/Pill';
import DashboardItem from '@/src/features/dashboard/components/DashboardItem';
import { axiosInstance } from '@/src/lib/axiosInstance';
import { styles } from '@/src/assets/styles/dashboard.styles';

type TabKey = 'in-progress' | 'past';

// TEMP (like your Cards screen): hardcode until we wire explorerId from state
const EXPLORER_ID = 134;

// TODO: broken import — should use DashboardItemData from feature types

export type DashboardConversation = {
  db_id: number;
  card_name: string;
  swap_explorer: string;
  swap_explorer_id: number;
  status: 'In progress' | 'Completed' | 'Declined';
  creator_id: number;
  recipient_id: number;
  unread: number; // backend should return number (COUNT(...)::int)
  last_message_at: string | null;
};

type PastCursor = {
  cursor_unread: 0 | 1;
  cursor_card: string;
  cursor_swap: string;
  cursor_id: number;
};

type PastCursorResponse = {
  conversations: DashboardConversation[];
  hasMore: boolean;
  nextCursor: PastCursor | null;
};

const PAST_PAGE_SIZE = 30;

export default function DashboardScreen() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const [activeTab, setActiveTab] = useState<TabKey>('in-progress');

  const [inProgress, setInProgress] = useState<DashboardConversation[]>([]);
  const [past, setPast] = useState<DashboardConversation[]>([]);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [pastHasMore, setPastHasMore] = useState(false);
  const [pastCursor, setPastCursor] = useState<PastCursor | null>(null);

  // UI-only: mark as unread/remind-me (no DB write)
  const [uiUnreadOverrides, setUiUnreadOverrides] = useState<
    Record<number, boolean>
  >({});

  // Prevent duplicate onEndReached calls
  const loadMoreLockRef = useRef(false);

  const authHeaders = useCallback(async () => {
    const token = await getTokenRef.current();
    return { Authorization: `Bearer ${token}` };
  }, []);

  const isUnread = useCallback(
    (conv: DashboardConversation) => {
      const override = uiUnreadOverrides[conv.db_id];
      if (override === true) return true;
      if (override === false) return false;
      return conv.unread > 0;
    },
    [uiUnreadOverrides],
  );

  const toggleUiUnread = useCallback((dbId: number) => {
    setUiUnreadOverrides((prev) => {
      const current = prev[dbId];
      // undefined -> force unread
      if (current === undefined) return { ...prev, [dbId]: true };
      // true -> force read
      if (current === true) return { ...prev, [dbId]: false };
      // false -> remove override
      const { [dbId]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const fetchInProgress = useCallback(async () => {
    const headers = await authHeaders();
    const resp = await axiosInstance.get(
      `/conversation/${EXPLORER_ID}?page=1&limit=40`,
      { headers },
    );
    return resp.data.conversations ?? [];
  }, [authHeaders]);

  const fetchPastFirst = useCallback(async () => {
    const headers = await authHeaders();
    const resp = await axiosInstance.get<PastCursorResponse>(
      `/conversation/past/${EXPLORER_ID}?mode=cursor&limit=${PAST_PAGE_SIZE}`,
      { headers, timeout: 20000 },
    );
    return resp.data;
  }, [authHeaders]);

  const fetchPastNext = useCallback(
    async (cursor: PastCursor) => {
      const headers = await authHeaders();
      const qs =
        `mode=cursor&limit=${PAST_PAGE_SIZE}` +
        `&cursor_unread=${cursor.cursor_unread}` +
        `&cursor_card=${encodeURIComponent(cursor.cursor_card)}` +
        `&cursor_swap=${encodeURIComponent(cursor.cursor_swap)}` +
        `&cursor_id=${cursor.cursor_id}`;

      const resp = await axiosInstance.get<PastCursorResponse>(
        `/conversation/past/${EXPLORER_ID}?${qs}`,
        { headers, timeout: 20000 },
      );
      return resp.data;
    },
    [authHeaders],
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

  const renderItem = useCallback(
    ({ item }: { item: DashboardConversation }) => (
      <DashboardItem
        item={item}
        unread={isUnread(item)}
        onToggleUnread={() => toggleUiUnread(item.db_id)}
        onPress={() => {
          // Next later: navigate to chat + fetch opportunities
        }}
      />
    ),
    [isUnread, toggleUiUnread],
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Dashboard
      </Text>

      <View style={styles.pillList}>
        <Pill
          text="In progress"
          isActive={activeTab === 'in-progress'}
          onPress={() => setActiveTab('in-progress')}
        />
        <Pill
          text="Past"
          isActive={activeTab === 'past'}
          onPress={() => setActiveTab('past')}
        />
      </View>

      {loadingInitial ? (
        <View style={{ paddingTop: 24 }}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          style={styles.transactionsList}
          contentContainerStyle={styles.transactionsListContent}
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.db_id)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={activeTab === 'past' ? loadMorePast : undefined}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            activeTab === 'past' && loadingMore ? (
              <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
