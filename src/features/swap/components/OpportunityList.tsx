import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';

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

  const header =
    selectedCardId != null ? (
      <View style={{ paddingTop: 10, paddingBottom: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '800' }}>
          People who can give you this card
        </Text>
        {selectedCardName ? (
          <Text style={{ marginTop: 4, opacity: 0.75 }}>
            {selectedCardName}
          </Text>
        ) : null}
      </View>
    ) : null;

  const listHeader = (
    <View>
      {topContent ? (
        <View style={{ paddingBottom: 6 }}>{topContent}</View>
      ) : null}
      {header}
    </View>
  );

  if (selectedCardId == null) {
    return (
      <FlatList<SwapOpportunityItem>
        data={[]}
        keyExtractor={(it) => String(it.explorer_id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 28,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={listHeader}
      />
    );
  }

  if (loadingOpportunities) {
    return (
      <View style={{ paddingTop: 10 }}>
        {listHeader}
        <View style={{ paddingVertical: 16 }}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  const showEmpty = opportunities.length === 0;

  return (
    <FlatList<SwapOpportunityItem>
      data={opportunities}
      keyExtractor={(it) => String(it.explorer_id)}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingBottom: 28,
      }}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        showEmpty ? (
          <View style={{ paddingVertical: 14 }}>
            <Text style={{ opacity: 0.6 }}>
              No opportunities available for {selectedCardName ?? 'this card'},
              try another card.
            </Text>
          </View>
        ) : null
      }
      onEndReached={opportunities.length > 0 ? onLoadMore : undefined}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        loadingMoreOpportunities ? (
          <View style={{ paddingVertical: 16 }}>
            <ActivityIndicator />
          </View>
        ) : null
      }
    />
  );
}
