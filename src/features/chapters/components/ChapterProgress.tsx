import { useMemo } from "react";
import { Text, View } from "react-native";
import { styles } from "@/src/assets/styles/cards.styles";

export default function ChapterProgress({
  value,
  max,
}: {
  value: number;
  max: number;
}) {
  const { pct, isFull } = useMemo(() => {
    if (max <= 0) return { pct: 0, isFull: false };

    const clampedValue = Math.max(0, Math.min(value, max));
    const pct = clampedValue / max;

    return { pct, isFull: value >= max };
  }, [value, max]);

  return (
    <View style={styles.chapterProgressWrap}>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${pct * 100}%` },
            isFull && styles.progressFillFull,
          ]}
        />
      </View>

      <Text style={styles.progressLabel}>
        {Math.max(0, value)}/{Math.max(0, max)}
      </Text>
    </View>
  );
}