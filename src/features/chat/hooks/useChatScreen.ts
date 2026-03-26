import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { useKeyboardVisible } from '@/src/hooks/useKeyboardVisible';
import type { Message } from '@/src/features/chat/types/MessageType';
import type { ConversationStatus } from '@/src/features/chat/types/ConversationStatus';
import * as chatApi from '@/src/features/chat/api/chatApi';

export function useChatScreen(args: {
  conversationId: number | null; // null = new conversation, created on first send
  swapExplorerId: number | null;
  cardName: string;
}) {
  const { swapExplorerId, cardName } = args;

  const { explorerId } = useExplorer();
  const { getToken } = useAuth();

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // resolvedConversationId starts from args and gets set after lazy creation
  const [resolvedConversationId, setResolvedConversationId] = useState<number | null>(args.conversationId);

  const [loading, setLoading] = useState(args.conversationId !== null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [conversationStatus, setConversationStatusState] =
    useState<ConversationStatus | null>(null);

  const authHeaders = useCallback(async () => {
    const token = await getTokenRef.current();
    return { Authorization: `Bearer ${token}` };
  }, []);

  const keyboardVisible = useKeyboardVisible();

  const canLoad = useMemo(() => {
    return resolvedConversationId !== null && Number.isFinite(resolvedConversationId) && Boolean(explorerId);
  }, [resolvedConversationId, explorerId]);

  const refreshMessages = useCallback(async () => {
    if (!canLoad || resolvedConversationId === null) return;
    const headers = await authHeaders();
    const { allMessages, conversationStatus } = await chatApi.getAllMessages({
      conversationId: resolvedConversationId,
      headers,
    });

    setMessages(allMessages);
    setConversationStatusState(conversationStatus);
  }, [authHeaders, canLoad, resolvedConversationId]);

  const markRead = useCallback(async () => {
    if (!explorerId || resolvedConversationId === null || !Number.isFinite(resolvedConversationId)) return;
    const headers = await authHeaders();
    await chatApi.markConversationRead({ conversationId: resolvedConversationId, explorerId, headers });
  }, [authHeaders, resolvedConversationId, explorerId]);

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

  // canSend does not require a conversationId — user can type before one exists
  const canSend = useMemo(() => {
    return (
      !!text.trim() &&
      !sending &&
      !!explorerId &&
      !!swapExplorerId
    );
  }, [text, sending, explorerId, swapExplorerId]);

  const sendMessage = useCallback(async () => {
    if (!canSend || !explorerId || !swapExplorerId) return;

    setSending(true);
    setError(null);

    // Use a local variable so we can reference the freshly created id
    // within this call without waiting for a state update.
    let cid = resolvedConversationId;

    try {
      const headers = await authHeaders();

      // Lazy creation: only POST when sending the first message
      if (cid === null) {
        const created = await chatApi.createConversation({
          explorerId,
          swapExplorerId,
          cardName,
          headers,
        });
        cid = created.id;
        setResolvedConversationId(cid);
      }

      await chatApi.postMessage({
        conversationId: cid,
        headers,
        payload: {
          content: text.trim(),
          timestamp: new Date().toISOString(),
          sender_id: Number(explorerId),
          recipient_id: Number(swapExplorerId),
          conversation_id: Number(cid),
        },
      });

      setText('');

      // Refresh and mark read using cid directly — avoids stale-closure
      // issues that would occur if we called refreshMessages()/markRead()
      // immediately after setResolvedConversationId above.
      const { allMessages, conversationStatus: newStatus } = await chatApi.getAllMessages({
        conversationId: cid,
        headers,
      });
      setMessages(allMessages);
      setConversationStatusState(newStatus);
      await chatApi.markConversationRead({ conversationId: cid, explorerId, headers }).catch(() => {});
    } catch (e) {
      setError('Could not send message');
    } finally {
      setSending(false);
    }
  }, [
    canSend,
    explorerId,
    swapExplorerId,
    cardName,
    authHeaders,
    resolvedConversationId,
    text,
  ]);

  const setConversationStatus = useCallback(
    async (status: ConversationStatus) => {
      if (resolvedConversationId === null || !Number.isFinite(resolvedConversationId)) return;

      setUpdatingStatus(true);
      setError(null);

      try {
        const headers = await authHeaders();
        await chatApi.updateConversationStatus({
          conversationId: resolvedConversationId,
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
    [authHeaders, resolvedConversationId],
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
    conversationStatus,
  };
}
