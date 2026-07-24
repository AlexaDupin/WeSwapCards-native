import React, { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from '@/src/assets/styles/chat.styles';
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

// Below this window height (dp) there isn't room for every band plus the
// keyboard, so the chat collapses its reference/action bands while typing.
// Most modern phones are taller and keep the full layout. Tunable.
const SMALL_SCREEN_MAX_HEIGHT = 720;

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
  const { height: windowHeight } = useWindowDimensions();

  // Only small screens run out of room for every band once the keyboard is up,
  // so the space-saving tweaks (compact offer bar, hidden status actions) are
  // limited to them — larger phones keep the full layout while typing.
  const isSmallScreen = windowHeight <= SMALL_SCREEN_MAX_HEIGHT;

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

  // KeyboardAvoidingView here comes from react-native-keyboard-controller: it
  // tracks the real, live IME insets (including the suggestion strip and
  // Android edge-to-edge), which the built-in RN component cannot. iOS is
  // presented as a modal card that still needs the header as a vertical offset.
  const isIOS = Platform.OS === 'ios';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding"
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

      {/* On small screens while typing, keep the bar visible for reference but
          compact (single scrollable row) so it doesn't wrap to several lines
          and push the composer off. Larger screens keep the full grid. */}
      <SwapOfferBar
        cards={offerableCards}
        loading={needFetch && offerLoading}
        compact={keyboardVisible && isSmallScreen}
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

      {/* Hide the status actions while typing only on small screens, where the
          row would otherwise crowd out the composer. Larger screens keep them
          visible so the common "thanks → Complete" flow stays one tap away. */}
      {conversationStatus == null || (keyboardVisible && isSmallScreen) ? null : (
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
