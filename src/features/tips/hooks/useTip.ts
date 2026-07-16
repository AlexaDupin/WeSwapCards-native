import { useCallback, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import type { TipKey } from '@/src/features/tips/data/tips';

export type TipStatus = 'loading' | 'seen' | 'unseen';

type UseTip = {
  status: TipStatus;
  dismiss: () => void;
};

// Keyed per explorer rather than per install: a tip teaches a person, not a
// device. Two collectors sharing a phone each get their own run, and one user's
// dismissals never silence another's. (The onboarding carousel is deliberately
// per-install instead — it runs before there is an explorer to key to.)
const storageKey = (explorerId: number, tip: TipKey) =>
  `tip.${explorerId}.${tip}`;

/**
 * Gates a single first-run tip for the signed-in explorer.
 *
 * `status` is `'loading'` until the persisted flag has been read, then
 * `'unseen'` (never dismissed) or `'seen'`. It stays `'loading'` while the
 * explorer is unresolved, so a tip is never shown against the wrong user.
 *
 * Mirrors the SecureStore usage in `useOnboarding` (best-effort get/set with
 * catches) so a storage failure never crashes or blocks the UI.
 */
export function useTip(tip: TipKey): UseTip {
  const { explorerId } = useExplorer();
  const [status, setStatus] = useState<TipStatus>('loading');

  useEffect(() => {
    if (explorerId == null) return;

    let cancelled = false;
    (async () => {
      const stored = await SecureStore.getItemAsync(
        storageKey(explorerId, tip),
      ).catch(
        // An unreadable store means we can't tell whether this was dismissed.
        // Stay quiet: re-showing a dismissed tip on every launch is worse than
        // never showing it at all.
        () => 'true',
      );
      if (cancelled) return;
      setStatus(stored == null ? 'unseen' : 'seen');
    })();

    return () => {
      cancelled = true;
    };
  }, [explorerId, tip]);

  const dismiss = useCallback(() => {
    // Hide immediately; persist fire-and-forget so a write failure never leaves
    // the tip stuck on screen.
    setStatus('seen');
    if (explorerId == null) return;
    SecureStore.setItemAsync(storageKey(explorerId, tip), 'true').catch(
      () => {},
    );
  }, [explorerId, tip]);

  return { status, dismiss };
}
