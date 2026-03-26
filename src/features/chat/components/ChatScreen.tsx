import React, { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from '@/src/assets/styles/chat.styles';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { useChatScreen } from '@/src/features/chat/hooks/useChatScreen';
import type { ConversationStatus } from '@/src/features/chat/types/ConversationStatus';

import MessageList, {
  type MessageListHandle,
} from '@/src/features/chat/components/MessageList';
import ConversationStatusBar from '@/src/features/chat/components/ConversationStatusBar';
import ChatComposer from '@/src/features/chat/components/ChatComposer';

type ChatScreenProps = {
  conversationId: number | null;
  cardName: string;
  swapName: string;
  swapExplorerId: number | null;
};

export default function ChatScreen({
  conversationId,
  cardName,
  swapName,
  swapExplorerId,
}: ChatScreenProps) {
  const { explorerId } = useExplorer();
  const insets = useSafeAreaInsets();

  const HEADER_H = 56;

  const messageListRef = useRef<MessageListHandle | null>(null);

  const {
    loading,
    error,
    messages,
    text,
    keyboardVisible,
    setText,
    canSend,
    sendMessage,
    updatingStatus,
    setConversationStatus,
    conversationStatus,
  } = useChatScreen({
    conversationId,
    swapExplorerId,
    cardName,
  });

  const bottomSpacer = insets.bottom + 8;

  const handleSend = useCallback(() => {
    const wasAtBottom = messageListRef.current?.getIsAtBottom() ?? true;
    sendMessage();
    if (wasAtBottom) messageListRef.current?.scrollToBottom(true);
  }, [sendMessage]);

  const handleConversationStatus = useCallback(
    async (status: ConversationStatus) => {
      const success = await setConversationStatus(status);
      if (success) router.back();
    },
    [setConversationStatus],
  );

  const handleInputFocus = useCallback(() => {
    messageListRef.current?.scrollToBottom(true);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={HEADER_H}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Ionicons name="close" size={22} color="#111" />
        </TouchableOpacity>

        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text numberOfLines={1} style={styles.headerTitle}>
            {swapName}
          </Text>
          <Text numberOfLines={1} style={styles.headerSubtitle}>
            {cardName}
          </Text>
        </View>

        <View style={{ width: 28 }} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {explorerId == null ? (
        <ActivityIndicator style={{ marginTop: 6 }} />
      ) : (
        <MessageList
          ref={messageListRef}
          loading={loading}
          messages={messages}
          explorerId={explorerId}
          bottomSpacer={bottomSpacer}
          conversationId={conversationId ?? 0}
        />
      )}

      {conversationStatus == null ? null : (
        <ConversationStatusBar
          updatingStatus={updatingStatus}
          conversationStatus={conversationStatus}
          onChangeStatus={handleConversationStatus}
        />
      )}
      <ChatComposer
        text={text}
        setText={setText}
        canSend={canSend}
        onSend={handleSend}
        onFocus={handleInputFocus}
        keyboardVisible={keyboardVisible}
        bottomInset={insets.bottom}
      />
    </KeyboardAvoidingView>
  );
}
