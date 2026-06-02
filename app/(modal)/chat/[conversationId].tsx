import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import ChatScreen from '@/src/features/chat/components/ChatScreen';

export default function ChatModalRoute() {
  const {
    conversationId,
    cardName,
    swapName,
    swapExplorerId,
    offeredCards: offeredCardsParam,
    creatorId: creatorIdParam,
    recipientId: recipientIdParam,
  } = useLocalSearchParams<{
    conversationId: string;
    cardName?: string;
    swapName?: string;
    swapExplorerId?: string;
    offeredCards?: string;
    creatorId?: string;
    recipientId?: string;
  }>();

  // 'new' signals a pending conversation with no DB row yet.
  const resolvedConversationId =
    conversationId === 'new' ? null : Number(conversationId);

  let parsedOfferedCards: { id: number; name: string }[] | undefined;
  if (offeredCardsParam != null) {
    try {
      parsedOfferedCards = JSON.parse(offeredCardsParam) as {
        id: number;
        name: string;
      }[];
    } catch {
      parsedOfferedCards = undefined;
    }
  }

  const parsedCreatorId =
    creatorIdParam != null ? Number(creatorIdParam) : null;
  const parsedRecipientId =
    recipientIdParam != null ? Number(recipientIdParam) : null;

  return (
    <ChatScreen
      conversationId={resolvedConversationId}
      cardName={cardName ?? ''}
      swapName={swapName ?? 'Chat'}
      swapExplorerId={swapExplorerId ? Number(swapExplorerId) : null}
      creatorId={parsedCreatorId}
      recipientId={parsedRecipientId}
      {...(parsedOfferedCards !== undefined
        ? { offeredCards: parsedOfferedCards }
        : {})}
    />
  );
}
