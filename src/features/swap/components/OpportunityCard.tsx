import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
        <View style={{ marginTop: 10 }}>
          <Text style={styles.bodyText}>
            In exchange, here are the cards you can offer them:
          </Text>
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
        <Text style={[styles.bodyText, { marginTop: 10 }]}>
          You do not have any new cards for this user, but you can still contact
          them.
        </Text>
      )}

      <Pressable
        onPress={() => onContact(opportunity)}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Contact ${opportunity.explorer_name} to swap`}
      >
        <Text style={styles.buttonText}>Contact this user to swap</Text>
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
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  dotActive: { backgroundColor: '#16A34A' },
  dotInactive: { backgroundColor: 'rgba(0,0,0,0.25)' },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.7,
  },
  bodyText: {
    fontSize: 13,
    opacity: 0.75,
    lineHeight: 18,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.06)',
    maxWidth: '100%',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.8,
  },
  button: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#0A84FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
  },
});

