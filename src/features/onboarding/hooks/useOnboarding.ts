import { useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

// Persisted flag marking that the intro carousel has been shown once for this
// install. Mirrors the SecureStore usage in the notifications feature
// (getItemAsync / setItemAsync with best-effort catches) so a storage failure
// never crashes or blocks the UI.
const HAS_SEEN_KEY = 'onboarding.hasSeen';

export type OnboardingStatus = 'loading' | 'seen' | 'unseen';

type UseOnboarding = {
  status: OnboardingStatus;
  markSeen: () => void;
};

/**
 * Gates the one-time first-launch onboarding carousel.
 *
 * `status` is `'loading'` until the persisted flag has been read (so callers can
 * avoid a flash of the wrong screen), then `'unseen'` (flag absent) or `'seen'`.
 * A read failure is treated as `'seen'`: a broken store must let the user into
 * the app, never trap them in onboarding.
 */
export function useOnboarding(): UseOnboarding {
  const [status, setStatus] = useState<OnboardingStatus>('loading');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await SecureStore.getItemAsync(HAS_SEEN_KEY).catch(
        // Treat an unreadable store as already-seen: skip onboarding rather than
        // block the user behind it.
        () => 'true',
      );
      if (cancelled) return;
      setStatus(stored == null ? 'unseen' : 'seen');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markSeen = () => {
    // Flip the UI immediately; persist fire-and-forget so a write failure never
    // blocks navigation out of onboarding.
    setStatus('seen');
    SecureStore.setItemAsync(HAS_SEEN_KEY, 'true').catch(() => {});
  };

  return { status, markSeen };
}
