import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { router } from 'expo-router';

import Pill from '@/src/components/Pill';
import DashboardItem from '@/src/features/dashboard/components/DashboardItem';
import { styles } from '@/src/assets/styles/dashboard.styles';
import { SignOutButton } from '@/src/components/SignOutButton';

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
            },
          });
        }}
      />
    ),
    [isUnread, setUiUnread, setConversationStatus],
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Dashboard
      </Text>
      <SignOutButton />

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
