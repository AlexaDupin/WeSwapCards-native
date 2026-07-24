import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { styles } from '@/src/assets/styles/chat.styles';
import type { Message } from '@/src/features/chat/types/MessageType';
import { formatMessageTimestamp } from '@/src/utils/dateTime';

type Mode = 'auto' | 'short' | 'long';

export type MessageListHandle = {
  scrollToBottom: (animated: boolean) => void;
  getIsAtBottom: () => boolean;
};

type MessageListProps = {
  conversationId: number;
  loading: boolean;
  messages: Message[];
  explorerId: number;
  bottomSpacer: number;
  refreshing: boolean;
  onRefresh: () => void;
};

const MessageList = forwardRef<MessageListHandle, MessageListProps>(
  (
    {
      conversationId,
      loading,
      messages,
      explorerId,
      bottomSpacer,
      refreshing,
      onRefresh,
    },
    ref,
  ) => {
    const listRef = useRef<FlatList<Message> | null>(null);
    const isAtBottomRef = useRef(true);
    const prevLenRef = useRef(0);

    const [listH, setListH] = useState(0);
    const [contentH, setContentH] = useState(0);

    const [mode, setMode] = useState<Mode>('auto');
    const didSetModeRef = useRef(false);

    useEffect(() => {
      didSetModeRef.current = false;
      setMode('auto');
      setListH(0);
      setContentH(0);
      isAtBottomRef.current = true;
      prevLenRef.current = 0;
    }, [conversationId]);

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

    // Keep the newest message in view when the list grows. Always follow the
    // user's own sent message (they expect to see what they just sent); for
    // incoming messages only follow if they were already at the bottom, so we
    // don't yank them away while they're reading history. Skips the initial
    // load (prevLen 0), where the list already starts at the latest message.
    useEffect(() => {
      const prevLen = prevLenRef.current;
      prevLenRef.current = messages.length;

      if (messages.length <= prevLen || prevLen === 0) return;

      const last = messages[messages.length - 1];
      const isMine = last?.sender_id === explorerId;
      if (isMine || isAtBottomRef.current) scrollToBottom(true);
    }, [messages, explorerId, scrollToBottom]);

    const onScroll = useCallback(
      (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;

        if (isLong) {
          isAtBottomRef.current = y <= 24;
        } else {
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
            <Text
              style={isMine ? styles.bubbleTextMine : styles.bubbleTextOther}
            >
              {item.content}
            </Text>

            <Text style={isMine ? styles.timestampMine : styles.timestampOther}>
              {formatMessageTimestamp(item.timestamp)}
            </Text>
          </View>
        );
      },
      [explorerId],
    );

    const listContentStyle = useMemo(() => {
      if (isLong) {
        return [
          styles.listContent,
          { paddingTop: bottomSpacer, paddingBottom: 12 },
        ];
      }
      return [styles.listContent, { paddingBottom: bottomSpacer + 12 }];
    }, [isLong, bottomSpacer]);

    useImperativeHandle(
      ref,
      () => ({
        scrollToBottom,
        getIsAtBottom: () => isAtBottomRef.current,
      }),
      [scrollToBottom],
    );

    return (
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
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    );
  },
);

MessageList.displayName = 'MessageList';

export default MessageList;
