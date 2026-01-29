// src/features/cards/components/ChapterKebabMenu.tsx
import React, { useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { styles } from "@/src/assets/styles/cards.styles";

type Props = {
  disabled?: boolean;
  onMarkAllOwned?: () => void;
  onMarkAllDuplicated?: () => void;
};

export default function ChapterKebabMenu({ disabled = false, onMarkAllOwned, onMarkAllDuplicated }: Props) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <Pressable
        onPress={() => !disabled && setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Chapter actions"
        style={({ pressed }) => [styles.kebabButton, pressed && styles.kebabPressed, disabled && styles.kebabDisabled]}
      >
        <Text style={styles.kebabText}>⋮</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.modalOverlay} onPress={close}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Actions</Text>

            <Pressable
              style={({ pressed }) => [styles.modalItem, pressed && styles.modalItemPressed]}
              onPress={() => {
                close();
                onMarkAllOwned?.();
              }}
            >
              <Text style={styles.modalItemText}>Mark all owned</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.modalItem, pressed && styles.modalItemPressed]}
              onPress={() => {
                close();
                onMarkAllDuplicated?.();
              }}
            >
              <Text style={styles.modalItemText}>Mark all duplicated</Text>
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
