import React, { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from '@/src/assets/styles/cards.styles';

type Props = {
  disabled?: boolean;
  onMarkAllCardsOwned: () => void;
};

/** Page-level actions for My cards, next to the help button. */
export default function CardsPageMenu({
  disabled = false,
  onMarkAllCardsOwned,
}: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Collection actions"
        accessibilityState={{ disabled }}
        style={({ pressed }) => [
          styles.kebabButton,
          pressed && styles.kebabPressed,
          disabled && styles.kebabDisabled,
        ]}
      >
        <Ionicons name="ellipsis-vertical" size={18} color="rgba(0,0,0,0.45)" />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable style={styles.modalOverlay} onPress={close}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Actions</Text>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.modalItem,
                pressed && styles.modalItemPressed,
              ]}
              onPress={() => {
                close();
                onMarkAllCardsOwned();
              }}
            >
              <Text style={styles.modalItemText}>Mark all cards as owned</Text>
            </Pressable>

            <Pressable style={styles.modalCancel} onPress={close}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
