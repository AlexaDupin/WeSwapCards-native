import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type Card = { id: number; name: string };

type Props = {
  cards: Card[];
  loading?: boolean;
};

const COLLAPSE_LIMIT = 3;

export default function SwapOfferBar({ cards, loading = false }: Props) {
  const [expanded, setExpanded] = useState(false);

  const hasMore = cards.length > COLLAPSE_LIMIT;
  const visibleCards =
    expanded || !hasMore ? cards : cards.slice(0, COLLAPSE_LIMIT);
  const hiddenCount = cards.length - COLLAPSE_LIMIT;

  return (
    <View style={styles.bar}>
      <Text style={styles.label}>You can offer in return</Text>
      {loading ? (
        <ActivityIndicator size="small" style={styles.spinner} />
      ) : cards.length === 0 ? (
        <Text style={styles.empty}>No missing card to exchange</Text>
      ) : (
        <View style={styles.chipsRow}>
          {visibleCards.map((card) => (
            <View key={card.id} style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>
                {card.name}
              </Text>
            </View>
          ))}
          {!expanded && hasMore ? (
            <View style={styles.chip}>
              <Text style={styles.chipText}>+{hiddenCount}</Text>
            </View>
          ) : null}
          {hasMore ? (
            <Pressable
              onPress={() => setExpanded((e) => !e)}
              style={styles.chevronBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={
                expanded ? 'Show fewer cards' : 'Show all cards'
              }
            >
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="rgba(0,0,0,0.45)"
              />
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'rgba(0,0,0,0.4)',
    marginBottom: 6,
  },
  spinner: {
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  empty: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.45)',
    fontStyle: 'italic',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.7)',
  },
  chevronBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
});
