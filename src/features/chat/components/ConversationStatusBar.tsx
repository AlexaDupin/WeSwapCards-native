import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from '@/src/assets/styles/chat.styles';
import type { ConversationStatus } from '@/src/features/chat/types/ConversationStatus';

type ConversationStatusBarProps = {
  updatingStatus: boolean;
  conversationStatus: ConversationStatus;
  onChangeStatus: (status: ConversationStatus) => void;
};

export default function ConversationStatusBar({
  updatingStatus,
  conversationStatus,
  onChangeStatus,
}: ConversationStatusBarProps) {
  const completeLabel =
    conversationStatus === 'Completed' ? 'Completed' : 'Complete';

  const declineLabel =
    conversationStatus === 'Declined' ? 'Declined' : 'Decline';

  return (
    <View style={styles.statusRow}>
      <Pressable
        onPress={() => onChangeStatus('Completed')}
        disabled={updatingStatus || conversationStatus === 'Completed'}
        style={({ pressed }) => [
          styles.statusButton,
          styles.statusComplete,
          (pressed || updatingStatus || conversationStatus === 'Completed') &&
            styles.statusButtonPressed,
        ]}
      >
        <Text style={styles.statusButtonText}>{completeLabel}</Text>
      </Pressable>

      <Pressable
        onPress={() => onChangeStatus('Declined')}
        disabled={updatingStatus || conversationStatus === 'Declined'}
        style={({ pressed }) => [
          styles.statusButton,
          styles.statusDecline,
          (pressed || updatingStatus || conversationStatus === 'Declined') &&
            styles.statusButtonPressed,
        ]}
      >
        <Text style={styles.statusButtonText}>{declineLabel}</Text>
      </Pressable>

      <Pressable
        onPress={() => onChangeStatus('In progress')}
        disabled={updatingStatus || conversationStatus === 'In progress'}
        accessibilityLabel="Reopen conversation"
        style={({ pressed }) => [
          styles.statusIconButton,
          styles.statusReopen,
          (pressed || updatingStatus || conversationStatus === 'In progress') &&
            styles.statusButtonPressed,
        ]}
      >
        <Ionicons name="refresh" size={18} color="#111" />
      </Pressable>
    </View>
  );
}
