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

const CHIP_HEIGHT = 36;

const styles = StyleSheet.create({
  chip: {
    height: CHIP_HEIGHT,
    borderRadius: CHIP_HEIGHT / 2,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipInactive: {
    backgroundColor: '#F2F4F7',
  },
  chipActive: {
    backgroundColor: '#E0F2FE',
  },
  chipPressed: {
    opacity: 0.85,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  textInactive: {
    color: '#344054',
  },
  textActive: {
    color: '#0369A1',
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
