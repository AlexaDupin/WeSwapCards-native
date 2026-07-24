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
import { useKeyboardHeight } from '@/src/hooks/useKeyboardHeight';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { useChatScreen } from '@/src/features/chat/hooks/useChatScreen';
import { useOfferableCards } from '@/src/features/chat/hooks/useOfferableCards';
import type { ConversationStatus } from '@/src/features/chat/types/ConversationStatus';

import { useBlockUser } from '@/src/features/moderation/hooks/useBlockUser';
import ChatModerationMenu from '@/src/features/moderation/components/ChatModerationMenu';
import MessageList, {
  type MessageListHandle,
} from '@/src/features/chat/components/MessageList';
import ConversationStatusBar from '@/src/features/chat/components/ConversationStatusBar';
import ChatComposer from '@/src/features/chat/components/ChatComposer';
import SwapOfferBar from '@/src/features/chat/components/SwapOfferBar';

type ChatScreenProps = {
  conversationId: number | null;
  cardName: string;
  swapName: string;
  swapExplorerId: number | null;
  offeredCards?: { id: number; name: string }[];
  creatorId?: number | null;
  recipientId?: number | null;
};

export default function ChatScreen({
  conversationId,
  cardName,
  swapName,
  swapExplorerId,
  offeredCards,
  creatorId,
  recipientId,
}: ChatScreenProps) {
  const { explorerId } = useExplorer();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  const needFetch = offeredCards == null && conversationId != null;
  const { cards: fetched, loading: offerLoading } = useOfferableCards({
    conversationId,
    creatorId: creatorId ?? null,
    recipientId: recipientId ?? null,
    enabled: needFetch,
  });
  const offerableCards = offeredCards ?? fetched;

  const HEADER_H = 56;

  // iOS presents this screen as a modal sheet that already sits below the
  // status bar, yet safe-area-context still reports the full window top inset
  // here. Adding it would double-count and leave a large blank gap at the top.
  // Android shows the modal full-screen, so it still needs the real inset.
  const topInset = Platform.OS === 'ios' ? 0 : insets.top;

  const messageListRef = useRef<MessageListHandle | null>(null);

  const {
    conversationId: resolvedConversationId,
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

  // Trust-and-safety state lives here (not in the menu) so the screen can also
  // show the blocked hint above the composer.
  const { isBlockedByMe, toggleBlock } = useBlockUser({
    swapExplorerId,
    swapName,
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

  // Android runs edge-to-edge, so the window is not resized for the keyboard
  // and KeyboardAvoidingView cannot lift the composer reliably (behavior
  // "height"/"padding" both leave it behind the keyboard once the offer bar
  // wraps to several lines). Instead we pad the root by the measured keyboard
  // height, which works regardless of edge-to-edge. iOS is presented as a modal
  // card where the padding behavior works, so it keeps using KAV.
  const isIOS = Platform.OS === 'ios';

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        isIOS ? null : { paddingBottom: keyboardHeight },
      ]}
      behavior={isIOS ? 'padding' : undefined}
      keyboardVerticalOffset={isIOS ? HEADER_H + topInset : 0}
    >
      <View style={[styles.header, { paddingTop: 18 + topInset }]}>
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

        {swapExplorerId != null ? (
          <ChatModerationMenu
            swapExplorerId={swapExplorerId}
            swapName={swapName}
            conversationId={resolvedConversationId}
            isBlockedByMe={isBlockedByMe}
            onToggleBlock={toggleBlock}
          />
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>

      <SwapOfferBar
        cards={offerableCards}
        loading={needFetch && offerLoading}
      />

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
      {isBlockedByMe === true ? (
        <Text style={styles.blockedHint}>
          You blocked this collector. Unblock to send messages.
        </Text>
      ) : null}
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
