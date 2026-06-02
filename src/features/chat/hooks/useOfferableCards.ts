import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import * as chatApi from '@/src/features/chat/api/chatApi';

type OfferableCard = { id: number; name: string };

type Args = {
  conversationId: number | null;
  creatorId: number | null;
  recipientId: number | null;
  enabled: boolean;
};

type Result = {
  cards: OfferableCard[];
  loading: boolean;
};

export function useOfferableCards({
  conversationId,
  creatorId,
  recipientId,
  enabled,
}: Args): Result {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reqIdRef = useRef(0);
  const [cards, setCards] = useState<OfferableCard[]>([]);
  const [loading, setLoading] = useState(false);

  const doFetch = useCallback(async () => {
    if (
      !enabled ||
      conversationId == null ||
      creatorId == null ||
      recipientId == null
    ) {
      return;
    }
    const id = ++reqIdRef.current;
    setLoading(true);
    try {
      const token = await getTokenRef.current();
      if (!token) throw new Error('missing_auth_token');
      const headers = { Authorization: `Bearer ${token}` };
      const items = await chatApi.fetchOfferableCards({
        conversationId,
        creatorId,
        recipientId,
        headers,
      });
      if (!mountedRef.current || reqIdRef.current !== id) return;
      setCards(
        items.map((item) => ({ id: item.card.id, name: item.card.name })),
      );
    } catch {
      if (!mountedRef.current || reqIdRef.current !== id) return;
      setCards([]);
    } finally {
      if (!mountedRef.current || reqIdRef.current !== id) return;
      setLoading(false);
    }
  }, [enabled, conversationId, creatorId, recipientId]);

  useEffect(() => {
    doFetch().catch(() => {});
  }, [doFetch]);

  if (!enabled) return { cards: [], loading: false };
  return { cards, loading };
}
