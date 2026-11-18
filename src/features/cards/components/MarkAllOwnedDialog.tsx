import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/src/constants/Colors';
import { Fonts } from '@/src/constants/typography';

type Props = {
  visible: boolean;
  totalCards: number;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

// A custom dialog rather than Alert.alert: a native alert cannot colour its
// buttons or bold a word, and both matter here. There is no undo, so the copy
// spells out what changes, what is kept, and what is left to do.
// Laid out like DeleteAccountDialog, with the accent blue of the header +.
export default function MarkAllOwnedDialog({
  visible,
  totalCards,
  pending,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={pending ? undefined : onCancel}
    >
      <Pressable
        style={styles.overlay}
        onPress={pending ? undefined : onCancel}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
      >
        <Pressable style={styles.card} testID="mark-all-owned-dialog">
          <View style={styles.iconCircle}>
            <Ionicons
              name="add-circle-outline"
              size={26}
              color={Colors.accent}
            />
          </View>

          <Text style={styles.title}>
            Mark <Text style={styles.emphasis}>ALL</Text> cards as owned?
          </Text>

          <Text style={styles.body}>
            <Text style={styles.strong}>All {totalCards} cards</Text> in every
            chapter will be marked as owned.
          </Text>

          <Text style={styles.body}>
            Cards you already logged, including your duplicates, stay as they
            are.
          </Text>

          <View style={styles.reminder}>
            <Text style={styles.reminderTitle}>
              Remember, you will still need to check all your cards:
            </Text>
            <Text style={styles.reminderItem}>
              • Press and hold the ones you’re missing
            </Text>
            <Text style={styles.reminderItem}>
              • Tap your duplicates again to mark them
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.confirmButton,
              pending && styles.confirmButtonDisabled,
              pressed && !pending && styles.confirmButtonPressed,
            ]}
            onPress={onConfirm}
            disabled={pending}
            accessibilityRole="button"
            accessibilityLabel="Confirm mark all as owned"
            accessibilityState={{ disabled: pending, busy: pending }}
          >
            {pending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.confirmText}>Mark all as owned</Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.cancelButtonPressed,
            ]}
            onPress={onCancel}
            disabled={pending}
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
    backgroundColor: 'rgba(37,99,235,0.08)',
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
  emphasis: {
    color: Colors.accent,
  },
  body: {
    fontFamily: Fonts.body.regular,
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.inkMuted,
    textAlign: 'center',
  },
  strong: {
    fontFamily: Fonts.body.bold,
    fontWeight: '700',
    color: Colors.ink,
  },
  reminder: {
    alignSelf: 'stretch',
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.tint,
    gap: 4,
  },
  reminderTitle: {
    fontFamily: Fonts.body.bold,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 2,
  },
  reminderItem: {
    fontFamily: Fonts.body.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.ink,
  },
  confirmButton: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.accent,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
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
