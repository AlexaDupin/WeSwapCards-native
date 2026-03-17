import { axiosInstance } from '@/src/lib/axiosInstance';

import type {
  SwapCard,
  SwapChapter,
  SwapOpportunitiesResponse,
} from '@/src/features/swap/types/SwapTypes';

type AuthHeaders = Record<string, string>;

type GetChaptersResponse = { places: SwapChapter[] };
type GetLatestChaptersResponse = { items: SwapChapter[] };
type GetCardsForPlaceResponse = { cards: SwapCard[] };

export async function fetchChapters(args?: {
  headers?: AuthHeaders;
}): Promise<SwapChapter[]> {
  const headers = args?.headers;
  const resp = await axiosInstance.get<GetChaptersResponse>(
    '/places',
    headers ? { headers } : undefined,
  );
  const data = resp.data as GetChaptersResponse;
  return data.places ?? [];
}

export async function fetchLatestChapters(args?: {
  headers?: AuthHeaders;
  limit?: number;
}): Promise<SwapChapter[]> {
  const headers = args?.headers;
  const limit = args?.limit;

  const resp = await axiosInstance.get<GetLatestChaptersResponse>(
    '/chapters/latest',
    {
      ...(headers ? { headers } : {}),
      ...(limit ? { params: { limit } } : {}),
    },
  );

  const data = resp.data as GetLatestChaptersResponse;
  return data.items ?? [];
}

export async function fetchCardsForChapter(args: {
  chapterId: number;
  headers?: AuthHeaders;
}): Promise<SwapCard[]> {
  const { chapterId, headers } = args;
  const resp = await axiosInstance.get<GetCardsForPlaceResponse>(
    `/cards/${chapterId}`,
    headers ? { headers } : undefined,
  );
  const data = resp.data as GetCardsForPlaceResponse;
  return data.cards ?? [];
}

/**
 * GET /opportunities/:explorerId/card/:cardId
 *
 * Backend response shape (source of truth):
 * { items: [...], pagination: { currentPage, totalPages, totalItems, itemsPerPage } }
 *
 * Requires auth.
 */
export async function fetchSwapOpportunities(args: {
  explorerId: number;
  cardId: number;
  page: number;
  limit: number;
  headers: AuthHeaders;
}): Promise<SwapOpportunitiesResponse> {
  const { explorerId, cardId, page, limit, headers } = args;

  const resp = await axiosInstance.get<SwapOpportunitiesResponse>(
    `/opportunities/${explorerId}/card/${cardId}`,
    { headers, params: { page, limit } },
  );

  return resp.data;
}
