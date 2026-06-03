import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  count?: number;
  active?: boolean;
  onPress: () => void;
};

function TabChip({ label, count = 0, active = false, onPress }: Props) {
  const showBadge = Number.isFinite(count) && count > 0;
  const badgeLabel = count > 99 ? '99+' : String(count);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        pressed && styles.chipPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text
        style={[styles.text, active ? styles.textActive : styles.textInactive]}
      >
        {label}
      </Text>

      {showBadge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

// Underline tab: no pill background; the active tab is bold charcoal with a
// charcoal underline indicator. Keeps the row to a single accent blue (the
// SegmentedToggle), reusing the bottom tab-bar charcoal.
const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  chipInactive: {},
  chipActive: {
    borderBottomColor: '#2563eb',
  },
  chipPressed: {
    opacity: 0.6,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
  textInactive: {
    color: '#6C757D',
  },
  textActive: {
    color: '#212529',
    fontWeight: '800',
  },
  badge: {
    minWidth: 18,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
});

export default memo(TabChip);
