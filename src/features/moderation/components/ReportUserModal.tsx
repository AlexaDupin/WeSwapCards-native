import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '@/src/constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';

import {
  REPORT_COMMENT_MAX_LENGTH,
  REPORT_REASONS,
} from '@/src/features/moderation/data/reportReasons';
import { useReportUser } from '@/src/features/moderation/hooks/useReportUser';
import type { ReportReason } from '@/src/features/moderation/types/ReportReason';

type Props = {
  visible: boolean;
  onClose: () => void;
  swapName: string;
  reportedExplorerId: number | null;
  conversationId: number | null;
};

// Conversation-level report: covers both the messages in this conversation and
// the collector who sent them — no per-message selection needed.
export default function ReportUserModal({
  visible,
  onClose,
  swapName,
  reportedExplorerId,
  conversationId,
}: Props) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [comment, setComment] = useState('');

  const { submit, submitting, submitted, error, reset } = useReportUser({
    reportedExplorerId,
    conversationId,
  });

  const close = () => {
    // Keep reason/comment after a failure (retry-friendly); clear after success.
    if (submitted) {
      setReason(null);
      setComment('');
    }
    reset();
    onClose();
  };

  const canSubmit = reason !== null && !submitting;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={close} />
        <View style={styles.sheet}>
          {submitted ? (
            <>
              <Text style={styles.title}>Report sent</Text>
              <Text style={styles.description}>
                Thanks — our team will review it.
              </Text>
              <TouchableOpacity style={styles.submitButton} onPress={close}>
                <Text style={styles.submitText}>Done</Text>
              </TouchableOpacity>
            </>
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.title}>
                Report conversation with {swapName}
              </Text>
              <Text style={styles.description}>
                Report inappropriate messages, harassment, spam, scams, or other
                behaviour in this conversation. Your report will also identify
                the collector involved.
              </Text>

              {REPORT_REASONS.map(({ value, label }) => {
                const selected = reason === value;
                return (
                  <Pressable
                    key={value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [
                      styles.reasonRow,
                      pressed && styles.reasonRowPressed,
                    ]}
                    onPress={() => setReason(value)}
                  >
                    <Ionicons
                      name={selected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={selected ? ACCENT : '#666'}
                    />
                    <Text style={styles.reasonText}>{label}</Text>
                  </Pressable>
                );
              })}

              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Add details (optional)"
                multiline
                maxLength={REPORT_COMMENT_MAX_LENGTH}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  !canSubmit && styles.submitDisabled,
                ]}
                onPress={() => {
                  if (reason !== null) void submit(reason, comment);
                }}
                disabled={!canSubmit}
              >
                <Text style={styles.submitText}>
                  {submitting ? 'Sending…' : 'Send report'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={close}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const ACCENT = Colors.accent;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    maxHeight: '85%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#555',
    marginBottom: 12,
    lineHeight: 18,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  reasonRowPressed: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  reasonText: {
    fontSize: 15,
    color: '#111',
  },
  commentInput: {
    marginTop: 10,
    minHeight: 70,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  error: {
    marginTop: 8,
    color: '#C0392B',
    fontSize: 13,
  },
  submitButton: {
    marginTop: 14,
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.8,
  },
});
