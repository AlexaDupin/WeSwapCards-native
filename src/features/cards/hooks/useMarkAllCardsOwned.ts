import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

import { markAllCardsOwned } from '@/src/features/cards/api/cardsApi';

type Params = {
  explorerId: number;
  /** Applies the result locally once the backend has saved it. */
  onMarked: () => void;
};

/**
 * Drives the "mark all cards as owned" flow: open the confirmation dialog,
 * then save and apply the result. The dialog itself is MarkAllOwnedDialog.
 */
export function useMarkAllCardsOwned({ explorerId, onMarked }: Params) {
  const { getToken } = useAuth();
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [isMarkingAllOwned, setIsMarkingAllOwned] = useState(false);
  const busyRef = useRef(false);

  const requestMarkAllCardsOwned = useCallback(() => {
    if (busyRef.current) return;
    setConfirmVisible(true);
  }, []);

  const cancelMarkAllCardsOwned = useCallback(() => {
    if (busyRef.current) return;
    setConfirmVisible(false);
  }, []);

  const confirmMarkAllCardsOwned = useCallback(async () => {
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
      setConfirmVisible(false);
    }
  }, [explorerId, onMarked]);

  return {
    confirmVisible,
    isMarkingAllOwned,
    requestMarkAllCardsOwned,
    cancelMarkAllCardsOwned,
    confirmMarkAllCardsOwned,
  };
}
