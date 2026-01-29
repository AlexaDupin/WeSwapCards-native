// src/features/cards/components/ChapterProgress.tsx
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { styles } from "@/src/assets/styles/cards.styles";

export default function ChapterProgress({ value, max }: { value: number; max: number }) {
  const pct = useMemo(() => {
    if (max <= 0) return 0;
    return Math.max(0, Math.min(1, value / max));
  }, [value, max]);

  return (
    <View style={styles.chapterProgressWrap}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>
        {value}/{max}
      </Text>
    </View>
  );
}
