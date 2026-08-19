import { axiosInstance } from '@/src/lib/axiosInstance';
import type { LatestChapter } from '../types/chapters.types';

export async function getLatestChapters(limit = 5): Promise<LatestChapter[]> {
  const res = await axiosInstance.get<{ items: LatestChapter[] }>(
    '/chapters/latest',
    {
      params: { limit },
    },
  );
  return res.data.items ?? [];
}

/**
 * The hand-picked "ephemeral vintage" chapters. The backend resolves them from
 * its VINTAGE_COLLECTOR_IDS env var and answers `{ items: [] }` when that is
 * unset, so an empty array here is a valid, expected result rather than a
 * failure.
 */
export async function getVintageChapters(): Promise<LatestChapter[]> {
  const res = await axiosInstance.get<{ items: LatestChapter[] }>(
    '/chapters/vintage',
  );
  return res.data.items ?? [];
}
