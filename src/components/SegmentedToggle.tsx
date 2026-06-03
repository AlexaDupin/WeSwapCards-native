import { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Option<T extends string> = { value: T; label: string };

type SegmentedToggleProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

// Reuse the blue used for selected tile borders on the Swap screen
// (LatestChaptersMiniTiles `tileSelected`) so the app keeps a single accent blue.
const ACCENT = '#2563eb';

/**
 * A compact segmented control with a "blue-outline pill" active state: a neutral
 * track, and the selected segment rendered as a white pill with a thin blue
 * border + blue text. Generic over a string-union value.
 */
function SegmentedToggleInner<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedToggleProps<T>) {
  return (
    <View style={[styles.wrap, style]} accessibilityRole="tablist">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.segment,
              active && styles.segmentActive,
              pressed && styles.segmentPressed,
            ]}
          >
            <Text
              style={[styles.text, active ? styles.textActive : styles.textInactive]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 999,
    padding: 3,
  },
  segment: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    // Keep inactive + active the same size so selecting doesn't shift layout
    // (the active border is drawn over a matching transparent border here).
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  segmentActive: {
    backgroundColor: '#fff',
    borderColor: ACCENT,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  segmentPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
  textActive: {
    color: ACCENT,
  },
  textInactive: {
    color: '#344054',
    opacity: 0.7,
  },
});

// memo keeps the generic signature via a cast.
const SegmentedToggle = memo(SegmentedToggleInner) as typeof SegmentedToggleInner;

export default SegmentedToggle;
