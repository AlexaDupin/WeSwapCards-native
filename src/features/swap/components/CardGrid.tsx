import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/src/constants/Colors';

import type { SwapCard } from '@/src/features/swap/types/SwapTypes';
import { Fonts } from '@/src/constants/typography';

type Props = {
  cards: SwapCard[];
  selectedCardId: number | null;
  onSelectCard: (cardId: number) => void;
  /** Cards the explorer does not own yet; each gets a small lock icon. */
  missingCardIds?: ReadonlySet<number>;
  /**
   * Kept for API compatibility. Both variants now render the same compact selector
   * because this is a lightweight filter, not a scrollable card grid.
   */
  variant?: 'list' | 'static';
};

function getCardNumberLabel(card: SwapCard): string {
  return String(card.number);
}

export default function CardGrid({
  cards,
  selectedCardId,
  onSelectCard,
  missingCardIds,
}: Props) {
  if (cards.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No cards found for this chapter.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {cards.map((item, index) => {
          const selected = item.id === selectedCardId;
          const label = getCardNumberLabel(item);
          const isLast = index === cards.length - 1;
          const missing = missingCardIds?.has(item.id) ?? false;

          return (
            <Pressable
              key={String(item.id)}
              onPress={() => onSelectCard(item.id)}
              style={({ pressed }) => [
                styles.selector,
                !isLast && styles.selectorSpacing,
                selected && styles.selectorSelected,
                pressed && styles.selectorPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select card ${label}${missing ? ', missing' : ''}`}
              accessibilityState={{ selected }}
            >
              {missing ? (
                <Ionicons
                  testID={`card-lock-${item.id}`}
                  name="lock-closed"
                  size={9}
                  color={selected ? '#fff' : 'rgba(0,0,0,0.35)'}
                  style={styles.lock}
                />
              ) : null}
              <Text
                numberOfLines={1}
                style={[
                  styles.selectorText,
                  selected && styles.selectorTextSelected,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 14,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selector: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.10)',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
  },
  selectorSpacing: {
    marginRight: 4,
  },
  selectorSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  // Pinned to the top-right corner so the number stays centred and every
  // tile keeps the same layout whether or not the card is missing.
  lock: {
    position: 'absolute',
    top: 3,
    right: 2,
  },
  selectorPressed: {
    opacity: 0.9,
  },
  selectorText: {
    fontFamily: Fonts.body.bold,
    fontSize: 13,
    fontWeight: '800',
    color: 'rgba(0,0,0,0.75)',
  },
  selectorTextSelected: {
    color: '#fff',
  },
  emptyState: {
    paddingVertical: 14,
  },
  emptyText: {
    opacity: 0.6,
  },
});
