import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { useKeyboardVisible } from '@/src/hooks/useKeyboardVisible';
import type { Message } from '@/src/features/chat/types/MessageType';
import type { ConversationStatus } from '@/src/features/chat/types/ConversationStatus';
import * as chatApi from '@/src/features/chat/api/chatApi';

export function useChatScreen(args: {
  conversationId: number;
  swapExplorerId: number | null;
}) {
  const { conversationId, swapExplorerId } = args;

  const { explorerId } = useExplorer();
  const { getToken } = useAuth();

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const authHeaders = useCallback(async () => {
    const token = await getTokenRef.current();
    return { Authorization: `Bearer ${token}` };
  }, []);

  const keyboardVisible = useKeyboardVisible();

  const canLoad = useMemo(() => {
    return Number.isFinite(conversationId) && Boolean(explorerId);
  }, [conversationId, explorerId]);

  const refreshMessages = useCallback(async () => {
    if (!canLoad) return;
    const headers = await authHeaders();
    const all = await chatApi.getAllMessages({ conversationId, headers });
    setMessages(all);
  }, [authHeaders, canLoad, conversationId]);

  const markRead = useCallback(async () => {
    if (!explorerId || !Number.isFinite(conversationId)) return;
    const headers = await authHeaders();
    await chatApi.markConversationRead({ conversationId, explorerId, headers });
  }, [authHeaders, conversationId, explorerId]);

  useEffect(() => {
    if (!canLoad) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        await refreshMessages();
        markRead().catch(() => {});
      } catch (e) {
        if (!cancelled) setError('Could not load messages');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [canLoad, refreshMessages, markRead]);

  const canSend = useMemo(() => {
    return (
      !!text.trim() &&
      !sending &&
      !!explorerId &&
      !!swapExplorerId &&
      Number.isFinite(conversationId)
    );
  }, [text, sending, explorerId, swapExplorerId, conversationId]);

  const sendMessage = useCallback(async () => {
    if (!canSend || !explorerId || !swapExplorerId) return;

    setSending(true);
    setError(null);

    try {
      const headers = await authHeaders();

      await chatApi.postMessage({
        conversationId,
        headers,
        payload: {
          content: text.trim(),
          timestamp: new Date().toISOString(),
          sender_id: Number(explorerId),
          recipient_id: Number(swapExplorerId),
          conversation_id: Number(conversationId),
        },
      });

      setText('');
      await refreshMessages();
      await markRead();
    } catch (e) {
      setError('Could not send message');
    } finally {
      setSending(false);
    }
  }, [
    canSend,
    explorerId,
    swapExplorerId,
    authHeaders,
    conversationId,
    text,
    refreshMessages,
    markRead,
  ]);

  const setConversationStatus = useCallback(
    async (status: ConversationStatus) => {
      if (!Number.isFinite(conversationId)) return;

      setUpdatingStatus(true);
      setError(null);

      try {
        const headers = await authHeaders();
        await chatApi.updateConversationStatus({
          conversationId,
          headers,
          status,
        });
        return true;
      } catch (e) {
        setError('Could not update conversation status');
        return false;
      } finally {
        setUpdatingStatus(false);
      }
    },
    [authHeaders, conversationId],
  );

  return {
    loading,
    error,
    messages,
    text,
    keyboardVisible,
    setText,
    sending,
    canSend,
    sendMessage,
    updatingStatus,
    setConversationStatus,
  };
}
