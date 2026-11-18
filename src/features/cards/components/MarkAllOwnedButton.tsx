import React from 'react';
import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from '@/src/assets/styles/cards.styles';
import { Colors } from '@/src/constants/Colors';

// Close to the A–Z / Latest toggle's height, used until it has been measured.
const DEFAULT_SIZE = 38;

type Props = {
  /** Diameter in px; the screen passes the measured toggle height. */
  size?: number | undefined;
  disabled?: boolean;
  onPress: () => void;
};

/**
 * Header button before the A–Z / Latest toggle. It opens the "mark all cards as owned"
 * confirmation directly: a one-item menu would only add a step.
 */
export default function MarkAllOwnedButton({
  size,
  disabled = false,
  onPress,
}: Props) {
  const diameter = size ?? DEFAULT_SIZE;

  return (
    <Pressable
      onPress={() => !disabled && onPress()}
      accessibilityRole="button"
      accessibilityLabel="Mark all cards as owned"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.markAllButton,
        { width: diameter, height: diameter },
        pressed && styles.markAllButtonPressed,
        disabled && styles.kebabDisabled,
      ]}
    >
      {/* Accent blue, as on the active A–Z / Latest toggle. The circle is the
          button's own border, sized to the toggle's measured height. */}
      <Ionicons
        name="add"
        size={Math.round(diameter * 0.58)}
        color={Colors.accent}
      />
    </Pressable>
  );
}
