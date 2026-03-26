import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ChatScreen from '@/src/features/chat/components/ChatScreen';

export default function ChatModalRoute() {
  const { conversationId, cardName, swapName, swapExplorerId } =
    useLocalSearchParams<{
      conversationId: string;
      cardName?: string;
      swapName?: string;
      swapExplorerId?: string;
    }>();

  // 'new' signals a pending conversation with no DB row yet.
  const resolvedConversationId = conversationId === 'new' ? null : Number(conversationId);

  return (
    <ChatScreen
      conversationId={resolvedConversationId}
      cardName={cardName ?? ''}
      swapName={swapName ?? 'Chat'}
      swapExplorerId={swapExplorerId ? Number(swapExplorerId) : null}
    />
  );
}
