import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import ReportUserModal from '@/src/features/moderation/components/ReportUserModal';

type Props = {
  swapExplorerId: number;
  swapName: string;
  conversationId: number | null;
  // Block state + action are hosted by the chat screen (useBlockUser) so it can
  // also render the "you blocked this collector" hint above the composer.
  isBlockedByMe: boolean | null;
  onToggleBlock: () => void;
};

// Kebab menu in the chat header: report the conversation, block/unblock the
// collector. Pattern: ChapterKebabMenu (Pressable trigger + Modal sheet).
export default function ChatModerationMenu({
  swapExplorerId,
  swapName,
  conversationId,
  isBlockedByMe,
  onToggleBlock,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Conversation actions"
        style={({ pressed }) => [
          styles.kebabButton,
          pressed && styles.kebabPressed,
        ]}
      >
        <Text style={styles.kebabText}>⋮</Text>
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
              style={({ pressed }) => [
                styles.modalItem,
                pressed && styles.modalItemPressed,
              ]}
              onPress={() => {
                close();
                setReportVisible(true);
              }}
            >
              <Text style={styles.modalItemText}>Report this conversation</Text>
            </Pressable>

            {isBlockedByMe !== null && (
              <Pressable
                style={({ pressed }) => [
                  styles.modalItem,
                  pressed && styles.modalItemPressed,
                ]}
                onPress={() => {
                  close();
                  onToggleBlock();
                }}
              >
                <Text style={[styles.modalItemText, styles.blockText]}>
                  {isBlockedByMe ? `Unblock ${swapName}` : `Block ${swapName}`}
                </Text>
              </Pressable>
            )}

            <Pressable style={styles.modalCancel} onPress={close}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      <ReportUserModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        swapName={swapName}
        reportedExplorerId={swapExplorerId}
        conversationId={conversationId}
      />
    </>
  );
}

const styles = StyleSheet.create({
  kebabButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.75,
  },
  kebabPressed: {
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  kebabText: {
    fontSize: 20,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    padding: 20,
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    opacity: 0.8,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  modalItemPressed: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  modalItemText: {
    fontSize: 16,
  },
  blockText: {
    color: '#C0392B',
  },
  modalCancel: {
    marginTop: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.8,
  },
});
