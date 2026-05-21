import { axiosInstance } from '@/src/lib/axiosInstance';

import type {
  CardItemData,
  CardStatus,
} from '@/src/features/cards/types/CardItemType';
import type { ChapterData } from '@/src/features/chapters/types/ChapterType';

type AuthHeaders = Record<string, string>;

type GetChaptersResponse = { places: ChapterData[] };
type GetCardsResponse = { cards: CardItemData[] };
type GetCardStatusesResponse = { statuses: Record<string, CardStatus> };
type UpsertCardResponse = {
  explorerId: number;
  cardId: number;
  duplicate: boolean;
  changed: boolean;
};

export type ChapterCardsStatus = 'owned' | 'duplicated';

export async function fetchPlaces(): Promise<ChapterData[]> {
  const resp = await axiosInstance.get<GetChaptersResponse>('/places');
  return resp.data.places;
}

export async function fetchCards(args: {
  headers: AuthHeaders;
}): Promise<CardItemData[]> {
  const { headers } = args;
  const resp = await axiosInstance.get<GetCardsResponse>('/cards', {
    headers,
  });
  return resp.data.cards;
}

export async function fetchCardStatuses(args: {
  explorerId: number;
  headers: AuthHeaders;
}): Promise<Record<string, CardStatus>> {
  const { explorerId, headers } = args;
  const resp = await axiosInstance.get<GetCardStatusesResponse>(
    `/cards/statuses/${explorerId}`,
    { headers },
  );
  return resp.data?.statuses ?? {};
}

export async function upsertExplorerCard(args: {
  explorerId: number;
  cardId: number;
  duplicate: boolean;
  headers: AuthHeaders;
}) {
  const { explorerId, cardId, duplicate, headers } = args;
  return axiosInstance.put<UpsertCardResponse>(
    `/explorercards/${explorerId}/cards/${cardId}`,
    { duplicate },
    { headers },
  );
}

export async function deleteExplorerCard(args: {
  explorerId: number;
  cardId: number;
  headers: AuthHeaders;
}) {
  const { explorerId, cardId, headers } = args;
  return axiosInstance.delete(`/explorercards/${explorerId}/cards/${cardId}`, {
    headers,
  });
}

export async function setChapterCardsStatus(args: {
  explorerId: number;
  chapterId: number;
  status: ChapterCardsStatus;
  headers: AuthHeaders;
}) {
  const { explorerId, chapterId, status, headers } = args;
  return axiosInstance.post(
    `/explorercards/${explorerId}/chapters/${chapterId}/status`,
    { status },
    { headers },
  );
}
