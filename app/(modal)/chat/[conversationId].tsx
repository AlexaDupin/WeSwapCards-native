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

  return (
    <ChatScreen
      conversationId={Number(conversationId)}
      cardName={cardName ?? ''}
      swapName={swapName ?? 'Chat'}
      swapExplorerId={swapExplorerId ? Number(swapExplorerId) : null}
    />
  );
}
