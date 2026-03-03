import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from '@/src/assets/styles/chat.styles';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { useChatScreen } from '@/src/features/chat/hooks/useChatScreen';
import type { Message } from '@/src/features/chat/types/MessageType';
import type { ConversationStatus } from '@/src/features/chat/types/ConversationStatus';

type Mode = 'auto' | 'short' | 'long';

type ChatScreenProps = {
  conversationId: number;
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

  const listRef = useRef<FlatList<Message> | null>(null);
  const isAtBottomRef = useRef(true);

  const [listH, setListH] = useState(0);
  const [contentH, setContentH] = useState(0);

  const [mode, setMode] = useState<Mode>('auto');
  const didSetModeRef = useRef(false);

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
  });

  useEffect(() => {
    didSetModeRef.current = false;
    setMode('auto');
    setListH(0);
    setContentH(0);
    isAtBottomRef.current = true;
  }, [conversationId]);

  const bottomSpacer = insets.bottom + 8;
  const isLong = mode === 'long';

  const decideModeIfReady = useCallback(
    (nextListH?: number, nextContentH?: number) => {
      const lh = nextListH ?? listH;
      const ch = nextContentH ?? contentH;

      if (nextListH != null) setListH(nextListH);
      if (nextContentH != null) setContentH(nextContentH);

      if (didSetModeRef.current) return;
      if (lh <= 0 || ch <= 0) return;

      const fits = ch < lh - 8;

      didSetModeRef.current = true;
      setMode(fits ? 'short' : 'long');
    },
    [listH, contentH],
  );

  const data = useMemo(() => {
    if (!isLong) return messages;
    return [...messages].reverse();
  }, [messages, isLong]);

  const scrollToBottom = useCallback(
    (animated: boolean) => {
      requestAnimationFrame(() => {
        if (isLong) {
          listRef.current?.scrollToOffset({ offset: 0, animated });
        } else {
          listRef.current?.scrollToEnd({ animated });
        }
      });
    },
    [isLong],
  );

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;

      // Track "at bottom" for send behavior
      if (isLong) {
        // inverted: bottom is near offset 0
        isAtBottomRef.current = y <= 24;
      } else {
        // normal: bottom is near end; approximate by checking distance to end
        const { contentSize, layoutMeasurement } = e.nativeEvent;
        const distanceFromEnd =
          contentSize.height - (y + layoutMeasurement.height);
        isAtBottomRef.current = distanceFromEnd <= 24;
      }
    },
    [isLong],
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => {
      const isMine = item.sender_id === explorerId;

      return (
        <View
          style={[
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleOther,
          ]}
        >
          <Text style={isMine ? styles.bubbleTextMine : styles.bubbleTextOther}>
            {item.content}
          </Text>

          <Text style={isMine ? styles.timestampMine : styles.timestampOther}>
            {new Date(item.timestamp).toLocaleString(undefined, {
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      );
    },
    [explorerId],
  );

  const handleSend = useCallback(() => {
    const wasAtBottom = isAtBottomRef.current;
    sendMessage();
    if (wasAtBottom) scrollToBottom(true);
  }, [sendMessage, scrollToBottom]);

  const handleConversationStatus = useCallback(
    async (status: ConversationStatus) => {
      const success = await setConversationStatus(status);
      if (success) router.back();
    },
    [setConversationStatus],
  );

  const handleInputFocus = useCallback(() => {
    // Make sure the latest message is visible when keyboard opens
    scrollToBottom(true);
  }, [scrollToBottom]);

  // Reserve space so last bubble never sits behind composer/home indicator.
  // In inverted mode, the "under last message" spacing is paddingTop.
  // In normal mode, it's paddingBottom.
  const listContentStyle = useMemo(() => {
    if (isLong) {
      return [
        styles.listContent,
        { paddingTop: bottomSpacer, paddingBottom: 12 },
      ];
    }
    return [styles.listContent, { paddingBottom: bottomSpacer + 12 }];
  }, [isLong, bottomSpacer]);

  const completeLabel =
    conversationStatus === 'Completed' ? 'Completed' : 'Complete';

  const declineLabel =
    conversationStatus === 'Declined' ? 'Declined' : 'Decline';

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

      <View
        style={{ flex: 1 }}
        onLayout={(e) =>
          decideModeIfReady(e.nativeEvent.layout.height, undefined)
        }
      >
        {loading ? (
          <ActivityIndicator style={{ marginTop: 6 }} />
        ) : (
          <FlatList
            ref={listRef}
            data={data}
            inverted={isLong}
            keyExtractor={(m) => String(m.id)}
            renderItem={renderItem}
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={listContentStyle}
            scrollIndicatorInsets={
              isLong
                ? { top: bottomSpacer, bottom: 0 }
                : { top: 0, bottom: bottomSpacer }
            }
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            onContentSizeChange={(_, h) => decideModeIfReady(undefined, h)}
          />
        )}
      </View>

      <View style={styles.statusRow}>
        <Pressable
          onPress={() => handleConversationStatus('Completed')}
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
          onPress={() => handleConversationStatus('Declined')}
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
          onPress={() => handleConversationStatus('In progress')}
          disabled={updatingStatus || conversationStatus === 'In progress'}
          accessibilityLabel="Reopen conversation"
          style={({ pressed }) => [
            styles.statusIconButton,
            styles.statusReopen,
            (pressed ||
              updatingStatus ||
              conversationStatus === 'In progress') &&
              styles.statusButtonPressed,
          ]}
        >
          <Ionicons name="refresh" size={18} color="#111" />
        </Pressable>
      </View>

      <View
        style={[
          styles.composer,
          // When keyboard is visible, don't add bottom safe-area padding under composer
          { paddingBottom: 12 + (keyboardVisible ? 0 : insets.bottom) },
        ]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message…"
          placeholderTextColor="#98A2B3"
          style={styles.input}
          multiline
          onFocus={handleInputFocus}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          style={[
            styles.sendButton,
            { backgroundColor: canSend ? '#0A84FF' : '#C7D2FE' },
          ]}
        >
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
