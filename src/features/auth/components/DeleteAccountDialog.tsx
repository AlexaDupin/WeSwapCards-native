import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/src/constants/Colors';
import { Fonts } from '@/src/constants/typography';

type Props = {
  visible: boolean;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

// A custom dialog rather than Alert.alert: the acknowledgement tick box is the
// point, and a native alert cannot hold one. Deleting is irreversible, so the
// confirm button stays disabled until the box is ticked.
export default function DeleteAccountDialog({
  visible,
  deleting,
  onCancel,
  onConfirm,
}: Props) {
  const [acknowledged, setAcknowledged] = useState(false);

  // Never carry a previous acknowledgement into a new opening of the dialog.
  useEffect(() => {
    if (!visible) setAcknowledged(false);
  }, [visible]);

  const canDelete = acknowledged && !deleting;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="trash-outline" size={24} color={Colors.ink} />
          </View>

          <Text style={styles.title}>Delete account?</Text>

          <Text style={styles.body}>
            This permanently deletes your account, card collection, duplicate
            statuses, conversations, and messages.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.checkRow,
              pressed && styles.checkRowPressed,
            ]}
            onPress={() => setAcknowledged((v) => !v)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acknowledged }}
            accessibilityLabel="I understand that this cannot be undone"
            hitSlop={6}
          >
            <Ionicons
              name={acknowledged ? 'checkbox' : 'square-outline'}
              size={22}
              color={acknowledged ? Colors.accent : Colors.inkMuted}
            />
            <Text style={styles.checkText}>
              I understand that this cannot be undone
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              !canDelete && styles.confirmButtonDisabled,
              pressed && canDelete && styles.confirmButtonPressed,
            ]}
            onPress={onConfirm}
            disabled={!canDelete}
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.confirmText}>
              {deleting ? 'Deleting…' : 'Delete my account'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.cancelButtonPressed,
            ]}
            onPress={onCancel}
            disabled={deleting}
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const DANGER = '#B5544B';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.head.bold,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  body: {
    fontFamily: Fonts.body.regular,
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
    marginTop: 18,
    paddingVertical: 8,
  },
  checkRowPressed: {
    opacity: 0.6,
  },
  checkText: {
    fontFamily: Fonts.body.regular,
    flex: 1,
    fontSize: 14,
    color: Colors.ink,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'stretch',
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: DANGER,
  },
  confirmButtonDisabled: {
    opacity: 0.35,
  },
  confirmButtonPressed: {
    opacity: 0.85,
  },
  confirmText: {
    fontFamily: Fonts.body.bold,
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  cancelButton: {
    alignSelf: 'stretch',
    marginTop: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonPressed: {
    opacity: 0.6,
  },
  cancelText: {
    fontFamily: Fonts.body.regular,
    fontSize: 15,
    color: Colors.inkMuted,
  },
});
