import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import * as moderationApi from '@/src/features/moderation/api/moderationApi';

// Owns the block/unblock flow for one chat partner: loads whether *I* blocked
// them (never whether they blocked me — that must not leak), and exposes a
// confirm-then-toggle action. Enforcement is server-side; this is just UI state.
export function useBlockUser(args: {
  swapExplorerId: number | null;
  swapName: string;
}) {
  const { swapExplorerId, swapName } = args;

  const { explorerId } = useExplorer();
  const { getToken } = useAuth();

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // null = not loaded yet (menu shows nothing block-related until known)
  const [isBlockedByMe, setIsBlockedByMe] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const authHeaders = useCallback(async () => {
    const token = await getTokenRef.current();
    return { Authorization: `Bearer ${token}` };
  }, []);

  useEffect(() => {
    if (!explorerId || swapExplorerId == null) return;

    let cancelled = false;

    (async () => {
      try {
        const headers = await authHeaders();
        const blocks = await moderationApi.getMyBlocks({ explorerId, headers });
        if (!cancelled) {
          setIsBlockedByMe(blocks.some((b) => b.blocked_id === swapExplorerId));
        }
      } catch {
        // Leave null: the menu simply won't offer Block/Unblock this time.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [explorerId, swapExplorerId, authHeaders]);

  const performToggle = useCallback(async () => {
    if (!explorerId || swapExplorerId == null || isBlockedByMe === null) return;

    setBusy(true);
    try {
      const headers = await authHeaders();
      if (isBlockedByMe) {
        await moderationApi.unblockUser({
          explorerId,
          targetExplorerId: swapExplorerId,
          headers,
        });
        setIsBlockedByMe(false);
      } else {
        await moderationApi.blockUser({
          explorerId,
          targetExplorerId: swapExplorerId,
          headers,
        });
        setIsBlockedByMe(true);
      }
    } catch {
      Alert.alert(
        'Something went wrong',
        'Could not update the block. Please check your connection and try again.',
      );
    } finally {
      setBusy(false);
    }
  }, [explorerId, swapExplorerId, isBlockedByMe, authHeaders]);

  const toggleBlock = useCallback(() => {
    if (isBlockedByMe === null || busy) return;

    if (isBlockedByMe) {
      Alert.alert(
        `Unblock ${swapName}?`,
        'You will be able to exchange messages again.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unblock',
            onPress: () => {
              void performToggle();
            },
          },
        ],
      );
      return;
    }

    Alert.alert(
      `Block ${swapName}?`,
      "You won't be able to send messages to each other. Existing messages stay visible.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: () => {
            void performToggle();
          },
        },
      ],
    );
  }, [isBlockedByMe, busy, swapName, performToggle]);

  return { isBlockedByMe, busy, toggleBlock };
}
