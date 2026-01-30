import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type Props = {
  onSelect: (letter: string) => void;
  lettersWithContent?: Set<string>;
  style?: any;
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function AZNav({ onSelect, lettersWithContent = new Set(), style }: Props) {
  const data = useMemo(
    () =>
      LETTERS.map((L) => ({
        letter: L,
        enabled: lettersWithContent.has(L),
      })),
    [lettersWithContent]
  );

  return (
    <View style={[styles.wrap, style]} accessibilityRole="toolbar" accessibilityLabel="Jump to letter">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
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
            <Text style={[styles.pillText, !enabled && styles.pillTextDisabled]}>{letter}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = {
  wrap: {
    width: "100%",
  },
  row: {
    paddingHorizontal: 12,
    gap: 8,
  },
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  pillPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  pillDisabled: {
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  pillText: {
    fontSize: 12,
    fontWeight: "800",
    opacity: 0.85,
  },
  pillTextDisabled: {
    opacity: 0.25,
  },
} as const;
