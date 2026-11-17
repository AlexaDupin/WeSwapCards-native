import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { styles } from '@/src/assets/styles/cards.styles';

type Props = {
  disabled?: boolean;
  onMarkAllCardsOwned: () => void;
};

/**
 * Shown while a new explorer has not logged any card yet, so they can start
 * from a full collection instead of tapping every card.
 */
export default function NewCollectorBanner({
  disabled = false,
  onMarkAllCardsOwned,
}: Props) {
  return (
    <View style={styles.newCollectorBanner} testID="new-collector-banner">
      <Text style={styles.newCollectorText}>
        New here? Mark all cards as owned, then press and hold the ones you’re
        missing and tap your duplicates again to mark them.
      </Text>

      <Pressable
        onPress={onMarkAllCardsOwned}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Mark all as owned"
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.newCollectorButton,
          pressed && styles.newCollectorButtonPressed,
        ]}
      >
        {disabled ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.newCollectorButtonText}>Mark all as owned</Text>
        )}
      </Pressable>
    </View>
  );
}
