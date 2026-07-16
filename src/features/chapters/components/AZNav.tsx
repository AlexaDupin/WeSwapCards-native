import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/constants/Colors';

type Props = {
  onSelect: (letter: string) => void;
  lettersWithContent?: Set<string>;
  style?: any;
};

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function AZNav({
  onSelect,
  lettersWithContent = new Set(),
  style,
}: Props) {
  const data = useMemo(
    () =>
      LETTERS.map((L) => ({
        letter: L,
        enabled: lettersWithContent.has(L),
      })),
    [lettersWithContent],
  );

  return (
    <View
      style={[styles.wrap, style]}
      accessibilityRole="toolbar"
      accessibilityLabel="Jump to letter"
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {data.map(({ letter, enabled }) => (
          <Pressable
            key={letter}
            onPress={() => enabled && onSelect(letter)}
            disabled={!enabled}
            style={({ pressed }) => [
              styles.pill,
              !enabled && styles.pillDisabled,
              enabled && pressed && styles.pillPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Jump to ${letter}`}
          >
            <Text
              style={[styles.pillText, !enabled && styles.pillTextDisabled]}
            >
              {letter}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = {
  wrap: {
    width: '100%',
    marginBottom: 12,
  },
  row: {
    paddingHorizontal: 12,
    gap: 8,
  },
  pill: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  pillPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  pillDisabled: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pillTextDisabled: {
    color: 'rgba(0,0,0,0.2)',
  },
} as const;
