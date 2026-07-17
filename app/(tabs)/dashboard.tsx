import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Platform,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { Link, router, useFocusEffect } from 'expo-router';

import TabChip from '@/src/components/TabChip';
import SegmentedToggle from '@/src/components/SegmentedToggle';
import DashboardItem from '@/src/features/dashboard/components/DashboardItem';
import TipBubble from '@/src/features/tips/components/TipBubble';
import { styles } from '@/src/assets/styles/dashboard.styles';
import { AccountButton } from '@/src/components/AccountButton';

import { useDashboard } from '@/src/features/dashboard/hooks/useDashboard';
import type { DashboardConversation } from '@/src/features/dashboard/types/DashboardTypes';

export default function DashboardScreen() {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  const { explorerId } = useExplorer();

  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const authHeaders = useCallback(async () => {
    const token = await getTokenRef.current();
    return { Authorization: `Bearer ${token}` };
  }, []);

  const {
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
  } = useDashboard({ explorerId, authHeaders });

  // Nothing to search on a tab with no conversations, so the box only adds
  // noise to the empty state. Search runs server-side, so an empty list does
  // NOT mean an empty tab: with a query active it means "no matches", and the
  // box has to stay or there'd be no way to clear the query. Focus keeps it
  // through the gap between clearing the query and the refetch landing.
  const [searchFocused, setSearchFocused] = useState(false);
  const showSearch =
    listData.length > 0 || searchQuery.trim().length > 0 || searchFocused;

  // Android gives initial focus to the first focusable view on a screen, which
  // here is the search box. RN only opens the keyboard for focus it was asked
  // for, so the result is a caret blinking on a screen the user never touched.
  // Hand that focus back on every entry to the tab; taps still focus normally.
  const searchRef = useRef<TextInput>(null);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return;

      // The grant lands during native layout, after this effect runs.
      const frame = requestAnimationFrame(() => searchRef.current?.blur());
      return () => cancelAnimationFrame(frame);
    }, []),
  );

  const renderItem = useCallback(
    ({ item }: { item: DashboardConversation }) => (
      <DashboardItem
        item={item}
        unread={isUnread(item)}
        onMarkUnread={() => setUiUnread(item.db_id, true)}
        onMarkCompleted={() => setConversationStatus(item.db_id, 'Completed')}
        onMarkDeclined={() => setConversationStatus(item.db_id, 'Declined')}
        onPress={() => {
          setUiUnread(item.db_id, false);
          router.push({
            pathname: '/(modal)/chat/[conversationId]',
            params: {
              conversationId: String(item.db_id),
              cardName: item.card_name,
              swapName: item.swap_explorer,
              swapExplorerId: String(item.swap_explorer_id),
              creatorId: String(item.creator_id),
              recipientId: String(item.recipient_id),
            },
          });
        }}
      />
    ),
    [isUnread, setUiUnread, setConversationStatus],
  );

  return (
    // The unpadded root anchors the floating tip; the inner view carries the
    // screen's own padding.
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Dashboard</Text>
          <AccountButton />
        </View>

        <View style={styles.pillList}>
          <View style={styles.tabChips}>
            <TabChip
              label="In progress"
              count={unreadCounts.inProgress}
              active={activeTab === 'in-progress'}
              onPress={() => setActiveTab('in-progress')}
            />
            <TabChip
              label="Past"
              count={unreadCounts.past}
              active={activeTab === 'past'}
              onPress={() => setActiveTab('past')}
            />
          </View>

          <SegmentedToggle
            options={[
              { value: 'date', label: 'Recent' },
              { value: 'name', label: 'Name' },
            ]}
            value={sortBy}
            onChange={setSortBy}
          />
        </View>

        {showSearch && (
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search by name or card"
            placeholderTextColor="rgba(0,0,0,0.4)"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        )}

        {loadingInitial && listData.length === 0 ? (
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
            ListEmptyComponent={
              searchQuery.trim() ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyTitle}>No matches</Text>
                  <Text style={styles.emptySubtitle}>
                    No conversations match “{searchQuery.trim()}”.
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>
                    {activeTab === 'in-progress' ? '💬' : '🗂️'}
                  </Text>
                  <Text style={styles.emptyTitle}>
                    {activeTab === 'in-progress'
                      ? 'No open conversations'
                      : 'No past conversations'}
                  </Text>
                  {activeTab === 'in-progress' ? (
                    <Link
                      href="/(tabs)/swap"
                      style={[styles.emptySubtitle, styles.emptyLink]}
                    >
                      Start swapping!
                    </Link>
                  ) : (
                    <Text style={styles.emptySubtitle}>
                      Completed and declined conversations will be archived
                      here.
                    </Text>
                  )}
                </View>
              )
            }
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

      <TipBubble tipKey="dashboard" />
    </View>
  );
}
