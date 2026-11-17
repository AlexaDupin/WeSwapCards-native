import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

import { markAllCardsOwned } from '@/src/features/cards/api/cardsApi';

type Params = {
  explorerId: number;
  totalCards: number;
  /** Applies the result locally once the backend has saved it. */
  onMarked: () => void;
};

/**
 * Confirms, then marks every card in every chapter as owned. There is no
 * undo, so the confirmation spells out what changes, what is kept (logged
 * cards and duplicates) and what is left to do.
 */
export function useMarkAllCardsOwned({
  explorerId,
  totalCards,
  onMarked,
}: Params) {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const [isMarkingAllOwned, setIsMarkingAllOwned] = useState(false);
  const busyRef = useRef(false);

  const perform = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setIsMarkingAllOwned(true);

    try {
      const token = await getTokenRef.current();
      if (!token) throw new Error('missing_auth_token');
      await markAllCardsOwned({
        explorerId,
        headers: { Authorization: `Bearer ${token}` },
      });
      onMarked();
    } catch {
      Alert.alert(
        'Something went wrong',
        'Could not mark all cards as owned. Please check your connection and try again.',
      );
    } finally {
      busyRef.current = false;
      setIsMarkingAllOwned(false);
    }
  }, [explorerId, onMarked]);

  const requestMarkAllCardsOwned = useCallback(() => {
    if (busyRef.current) return;

    Alert.alert(
      'Mark all cards as owned?',
      `All ${totalCards} cards in every chapter will be marked as owned. ` +
        'Cards you already logged, including your duplicates, stay as they are.\n\n' +
        'Then press and hold the cards you’re missing to remove them, ' +
        'and tap your duplicates again to mark them as duplicated.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark all as owned',
          onPress: () => {
            void perform();
          },
        },
      ],
    );
  }, [perform, totalCards]);

  return { requestMarkAllCardsOwned, isMarkingAllOwned };
}
