import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Pressable,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { router } from 'expo-router';

import TabChip from '@/src/components/TabChip';
import DashboardItem from '@/src/features/dashboard/components/DashboardItem';
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

      <TextInput
        style={styles.searchInput}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name or card"
        placeholderTextColor="rgba(0,0,0,0.4)"
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      <View style={styles.filterRow}>
        <View style={styles.sortSegmentWrap} accessibilityRole="tablist">
          <Pressable
            onPress={() => setSortBy('date')}
            accessibilityRole="tab"
            accessibilityState={{ selected: sortBy === 'date' }}
            style={({ pressed }) => [
              styles.sortSegment,
              sortBy === 'date' && styles.sortSegmentActive,
              pressed && styles.sortSegmentPressed,
            ]}
          >
            <Text
              style={[
                styles.sortSegmentText,
                sortBy === 'date' && styles.sortSegmentTextActive,
              ]}
            >
              Recent
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSortBy('name')}
            accessibilityRole="tab"
            accessibilityState={{ selected: sortBy === 'name' }}
            style={({ pressed }) => [
              styles.sortSegment,
              sortBy === 'name' && styles.sortSegmentActive,
              pressed && styles.sortSegmentPressed,
            ]}
          >
            <Text
              style={[
                styles.sortSegmentText,
                sortBy === 'name' && styles.sortSegmentTextActive,
              ]}
            >
              Name
            </Text>
          </Pressable>
        </View>
      </View>

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
                <Text style={styles.emptySubtitle}>
                  {activeTab === 'in-progress'
                    ? 'Start swapping!'
                    : 'Completed and declined conversations will be archived here.'}
                </Text>
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
  );
}
