import { useEffect, useRef, useState } from 'react';

import {
  getLatestChapters,
  getVintageChapters,
} from '@/src/features/chapters/api/chapters.api';
import type { LatestChapter } from '@/src/features/chapters/types/chapters.types';

/** One carousel row's worth of state. */
export type ChapterRow = {
  items: LatestChapter[];
  loading: boolean;
  error: string | null;
};

const EMPTY_ROW: ChapterRow = { items: [], loading: true, error: null };

const ERROR_MESSAGE = 'Unable to load data.';

// The web asks for 10 and reuses the first two for the hero art, so the landing
// page makes one request instead of two. Do the same here.
const LATEST_LIMIT = 10;

/**
 * The landing page's chapter data: the latest chapters (shared by the hero card
 * stack and the first carousel) and the hand-picked vintage series.
 *
 * The two requests are independent, so one failing must not blank the other.
 * Each row therefore carries its own loading and error state.
 */
export function useLandingChapters(enabled = true) {
  const [latest, setLatest] = useState<ChapterRow>(EMPTY_ROW);
  const [vintage, setVintage] = useState<ChapterRow>(EMPTY_ROW);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // A signed-in user, or one still on the onboarding carousel, only mounts
    // this screen to be redirected off it. Skip the requests rather than firing
    // two that nothing will ever render.
    if (!enabled) {
      return () => {
        mountedRef.current = false;
      };
    }

    void (async () => {
      try {
        const items = await getLatestChapters(LATEST_LIMIT);
        if (mountedRef.current)
          setLatest({ items, loading: false, error: null });
      } catch (err) {
        console.error('landing: latest chapters failed', err);
        if (mountedRef.current) {
          setLatest({ items: [], loading: false, error: ERROR_MESSAGE });
        }
      }
    })();

    void (async () => {
      try {
        const items = await getVintageChapters();
        if (mountedRef.current) {
          setVintage({ items, loading: false, error: null });
        }
      } catch (err) {
        console.error('landing: vintage chapters failed', err);
        if (mountedRef.current) {
          setVintage({ items: [], loading: false, error: ERROR_MESSAGE });
        }
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, [enabled]);

  return { latest, vintage };
}
