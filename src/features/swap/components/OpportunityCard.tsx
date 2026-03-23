import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/src/constants/Colors';
import type { SwapOpportunityItem } from '@/src/features/swap/types/SwapTypes';

type Props = {
  opportunity: SwapOpportunityItem;
  onContact: (opportunity: SwapOpportunityItem) => void;
};

function isRecentlyActive(lastActiveAt?: string | null) {
  if (!lastActiveAt) return false;
  const last = new Date(lastActiveAt);
  if (Number.isNaN(last.getTime())) return false;
  const twoDaysAgo = new Date();
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
  return last > twoDaysAgo;
}

export default function OpportunityCard({ opportunity, onContact }: Props) {
  const active = useMemo(
    () => isRecentlyActive(opportunity.last_active_at),
    [opportunity.last_active_at],
  );

  const offeredNames = useMemo(() => {
    return opportunity.opportunities.map((o) => o.card.name).filter(Boolean);
  }, [opportunity.opportunities]);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name} numberOfLines={1}>
          {opportunity.explorer_name}
        </Text>

        <View style={styles.badgeRow}>
          <View
            style={[
              styles.dot,
              active ? styles.dotActive : styles.dotInactive,
            ]}
          />
          <Text style={styles.badgeText}>{active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      {offeredNames.length > 0 ? (
        <View style={styles.offeredSection}>
          <Text style={styles.offeredLabel}>You can offer</Text>
          <View style={styles.tagsWrap}>
            {offeredNames.map((n) => (
              <View key={n} style={styles.tag}>
                <Text style={styles.tagText} numberOfLines={1}>
                  {n}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <Text style={styles.noOffersText}>
          No new cards to offer, but you can still reach out.
        </Text>
      )}

      <Pressable
        onPress={() => onContact(opportunity)}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Contact ${opportunity.explorer_name}`}
      >
        <Text style={styles.buttonText}>Contact</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    color: '#000',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
  },
  dotActive: { backgroundColor: '#16A34A' },
  dotInactive: { backgroundColor: 'rgba(0,0,0,0.2)' },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(0,0,0,0.45)',
  },
  offeredSection: {
    marginTop: 12,
  },
  offeredLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'rgba(0,0,0,0.4)',
    marginBottom: 8,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.06)',
    maxWidth: '100%',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.7)',
  },
  noOffersText: {
    marginTop: 10,
    fontSize: 12,
    color: 'rgba(0,0,0,0.45)',
    fontStyle: 'italic',
    lineHeight: 17,
  },
  button: {
    marginTop: 14,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});

