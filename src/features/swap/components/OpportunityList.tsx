import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import OpportunityCard from '@/src/features/swap/components/OpportunityCard';
import type { SwapOpportunityItem } from '@/src/features/swap/types/SwapTypes';

type Props = {
  selectedCardId: number | null;
  selectedCardName: string | null;

  opportunities: SwapOpportunityItem[];
  loadingOpportunities: boolean;
  loadingMoreOpportunities: boolean;

  onLoadMore: () => void;
  onContact: (opportunity: SwapOpportunityItem) => void;
  topContent?: React.ReactNode;
};

export default function OpportunityList({
  selectedCardId,
  selectedCardName,
  opportunities,
  loadingOpportunities,
  loadingMoreOpportunities,
  onLoadMore,
  onContact,
  topContent,
}: Props) {
  const renderItem = useCallback(
    ({ item }: { item: SwapOpportunityItem }) => (
      <OpportunityCard opportunity={item} onContact={onContact} />
    ),
    [onContact],
  );

  const sectionHeader =
    selectedCardId != null ? (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>Opportunities for</Text>
        {selectedCardName ? (
          <Text style={styles.sectionCardName} numberOfLines={2}>
            {selectedCardName}
          </Text>
        ) : null}
      </View>
    ) : null;

  const listHeader = (
    <View>
      {topContent ? <View style={styles.topContent}>{topContent}</View> : null}
      {sectionHeader}
    </View>
  );

  if (selectedCardId == null) {
    return (
      <FlatList<SwapOpportunityItem>
        data={[]}
        keyExtractor={(it) => String(it.explorer_id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={listHeader}
      />
    );
  }

  if (loadingOpportunities) {
    return (
      <View style={styles.loadingWrap}>
        {listHeader}
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  return (
    <FlatList<SwapOpportunityItem>
      data={opportunities}
      keyExtractor={(it) => String(it.explorer_id)}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No swap partners yet</Text>
          <Text style={styles.emptySubtitle}>
            Nobody currently has{' '}
            <Text style={styles.emptyCardName}>
              {selectedCardName ?? 'this card'}
            </Text>{' '}
            available to swap. Try selecting another card.
          </Text>
        </View>
      }
      onEndReached={opportunities.length > 0 ? onLoadMore : undefined}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMoreOpportunities ? (
          <View style={styles.loader}>
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  topContent: {
    paddingBottom: 6,
  },
  separator: {
    height: 10,
  },
  sectionHeader: {
    paddingTop: 10,
    paddingBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(0,0,0,0.4)',
    marginBottom: 3,
  },
  sectionCardName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000',
  },
  loadingWrap: {
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  loader: {
    paddingVertical: 16,
  },
  emptyContainer: {
    marginTop: 8,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.7)',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyCardName: {
    fontWeight: '700',
    color: 'rgba(0,0,0,0.7)',
  },
});
