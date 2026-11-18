import React from 'react';
import { Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from '@/src/assets/styles/cards.styles';
import { Colors } from '@/src/constants/Colors';

type Props = {
  disabled?: boolean;
  onPress: () => void;
};

/**
 * Header button next to the help icon. It opens the "mark all cards as owned"
 * confirmation directly: a one-item menu would only add a step.
 */
export default function MarkAllOwnedButton({
  disabled = false,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={() => !disabled && onPress()}
      accessibilityRole="button"
      accessibilityLabel="Mark all cards as owned"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.kebabButton,
        styles.markAllButton,
        pressed && styles.kebabPressed,
        disabled && styles.kebabDisabled,
      ]}
    >
      {/* Accent blue, as on the active A–Z / Latest toggle, so the action
          stands out from the grey help icon next to it. */}
      <Ionicons name="add-circle-outline" size={26} color={Colors.accent} />
    </Pressable>
  );
}
