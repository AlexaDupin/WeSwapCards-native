import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useFocusEffect } from '@react-navigation/native';

import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { fetchCardStatuses } from '@/src/features/cards/api/cardsApi';
import type { CardStatus } from '@/src/features/cards/types/CardItemType';
import type { SwapCard } from '@/src/features/swap/types/SwapTypes';

const EMPTY: ReadonlySet<number> = new Set();

/**
 * Ids of the given cards the signed-in explorer does not own yet.
 *
 * Statuses are refetched each time the screen gains focus, so cards marked on
 * the My cards screen are reflected when coming back. While the statuses are
 * unknown (signed out, still loading, or the request failed) no card is
 * reported as missing, so the grid renders exactly as it would without this.
 */
export function useMissingCards(cards: SwapCard[]): ReadonlySet<number> {
  const { explorerId } = useExplorer();
  const { getToken } = useAuth();

  // Clerk returns a new getToken on every render; keep the fetch callback
  // stable so the focus effect does not re-run on each render.
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const [statuses, setStatuses] = useState<Record<string, CardStatus> | null>(
    null,
  );
  const reqId = useRef(0);

  const loadStatuses = useCallback(() => {
    const id = ++reqId.current;

    if (!explorerId) {
      setStatuses(null);
      return () => {};
    }

    let active = true;
    (async () => {
      try {
        const token = await getTokenRef.current();
        if (!token) throw new Error('missing_auth_token');
        const result = await fetchCardStatuses({
          explorerId,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (active && reqId.current === id) setStatuses(result);
      } catch {
        // Keep the last known statuses: a failed refresh should not make
        // every card look missing or hide the locks already shown.
      }
    })();

    return () => {
      active = false;
    };
  }, [explorerId]);

  useFocusEffect(loadStatuses);

  return useMemo(() => {
    if (!statuses) return EMPTY;
    const missing = new Set<number>();
    for (const card of cards) {
      const status = statuses[String(card.id)];
      if (status !== 'owned' && status !== 'duplicated') missing.add(card.id);
    }
    return missing;
  }, [cards, statuses]);
}
