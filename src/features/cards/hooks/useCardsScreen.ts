import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FlatList } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';

import {
  deleteExplorerCard,
  fetchCardStatuses,
  fetchCards,
  fetchPlaces,
  setChapterCardsStatus,
  upsertExplorerCard,
} from '@/src/features/cards/api/cardsApi';

import type {
  CardItemData,
  CardStatus,
} from '@/src/features/cards/types/CardItemType';
import type { ChapterData } from '@/src/features/chapters/types/ChapterType';
import useAZIndex from '@/src/features/chapters/hooks/useAZIndex';

export type ChapterUI = {
  chapterId: number;
  chapterName: string;
  cards: CardItemData[];
  ownedOrDuplicatedCount: number;
};

type Params = {
  explorerId: number;
};

const getNextStatus = (current: CardStatus): CardStatus => {
  switch (current) {
    case 'default':
      return 'owned';
    case 'owned':
      return 'duplicated';
    case 'duplicated':
      return 'owned';
    default:
      return 'owned';
  }
};

export function useCardsScreen({ explorerId }: Params) {
  const { getToken } = useAuth();

  const [cardStatuses, setCardStatuses] = useState<Record<string, CardStatus>>(
    {},
  );
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [cards, setCards] = useState<CardItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortLatest, setSortLatest] = useState(false);

  const [pendingChapters, setPendingChapters] = useState<Set<number>>(
    new Set(),
  );

  const listRef = useRef<FlatList<ChapterUI>>(null);
  const pendingChaptersRef = useRef(new Set<number>());

  // Mirror the latest statuses in a ref so the per-card callbacks below can
  // read the current value without listing `cardStatuses` as a dependency.
  // Keeping those callbacks stable lets the memoized CardItem skip re-rendering
  // every card whenever a single card's status changes.
  const cardStatusesRef = useRef(cardStatuses);
  useEffect(() => {
    cardStatusesRef.current = cardStatuses;
  }, [cardStatuses]);

  const fetchAllChapters = useCallback(async () => {
    const places = await fetchPlaces();
    setChapters(places);
  }, []);

  const fetchAllCards = useCallback(async () => {
    const token = await getToken();
    const cards = await fetchCards({
      headers: { Authorization: `Bearer ${token}` },
    });
    setCards(cards);
  }, [getToken]);

  const fetchAllCardStatuses = useCallback(
    async (id: number) => {
      const token = await getToken();
      const statuses = await fetchCardStatuses({
        explorerId: id,
        headers: { Authorization: `Bearer ${token}` },
      });

      setCardStatuses((prev) => {
        if (!statuses || typeof statuses !== 'object') return prev;
        if (Object.keys(statuses).length === 0) return prev;
        return statuses;
      });
    },
    [getToken],
  );

  const reload = useCallback(async () => {
    await Promise.all([
      fetchAllChapters(),
      fetchAllCards(),
      fetchAllCardStatuses(explorerId),
    ]);
  }, [explorerId, fetchAllChapters, fetchAllCards, fetchAllCardStatuses]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await Promise.all([
          fetchAllChapters(),
          fetchAllCards(),
          fetchAllCardStatuses(explorerId),
        ]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [explorerId, fetchAllChapters, fetchAllCards, fetchAllCardStatuses]);

  const cardsByPlaceId = useMemo(() => {
    const map: Record<number, CardItemData[]> = {};
    for (const c of cards) (map[c.place_id] ??= []).push(c);
    return map;
  }, [cards]);

  const chaptersData: ChapterUI[] = useMemo(() => {
    const base = chapters.map((ch) => {
      const chapterCards = cardsByPlaceId[ch.id] ?? [];
      const ownedOrDuplicatedCount = chapterCards.reduce((acc, card) => {
        const s = cardStatuses[String(card.id)] ?? 'default';
        return s === 'owned' || s === 'duplicated' ? acc + 1 : acc;
      }, 0);

      return {
        chapterId: ch.id,
        chapterName: ch.name,
        cards: chapterCards,
        ownedOrDuplicatedCount,
      };
    });

    if (sortLatest) return [...base].sort((a, b) => b.chapterId - a.chapterId);

    const collator = new Intl.Collator(undefined, {
      sensitivity: 'base',
      numeric: true,
    });
    return [...base].sort((a, b) =>
      collator.compare(a.chapterName, b.chapterName),
    );
  }, [chapters, cardsByPlaceId, cardStatuses, sortLatest]);

  const chaptersForAZ = useMemo(
    () =>
      chaptersData.map(({ chapterId, chapterName }) => ({
        id: chapterId,
        name: chapterName,
      })),
    [chaptersData],
  );

  const { lettersWithChapters, scrollToLetter } = useAZIndex({
    chapters: chaptersForAZ,
    listRef,
    enabled: true,
  });

  const upsertCard = useCallback(
    async (cardId: number, duplicate: boolean) => {
      const token = await getToken();

      const response = await upsertExplorerCard({
        explorerId,
        cardId,
        duplicate,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setCardStatuses((prev) => ({
          ...prev,
          [String(cardId)]: response.data.duplicate ? 'duplicated' : 'owned',
        }));
      }
    },
    [explorerId, getToken],
  );

  const onSelectCard = useCallback(
    async (cardId: number) => {
      const currentStatus =
        cardStatusesRef.current[String(cardId)] ?? 'default';
      const nextStatus = getNextStatus(currentStatus);

      if (nextStatus === 'owned') return upsertCard(cardId, false);
      if (nextStatus === 'duplicated') return upsertCard(cardId, true);
    },
    [upsertCard],
  );

  const onResetCard = useCallback(
    async (cardId: number) => {
      const current = cardStatusesRef.current[String(cardId)] ?? 'default';
      if (current === 'default') return;

      try {
        const token = await getToken();
        const response = await deleteExplorerCard({
          explorerId,
          cardId,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setCardStatuses((prev) => ({ ...prev, [String(cardId)]: 'default' }));
        } else {
          console.warn('Unexpected reset status:', response.status);
        }
      } catch (error) {
        console.error('Error during card deletion', error);
      }
    },
    [explorerId, getToken],
  );

  const setChapterStatus = useCallback(
    async (chapterId: number, status: 'owned' | 'duplicated') => {
      if (pendingChaptersRef.current.has(chapterId)) return;

      pendingChaptersRef.current.add(chapterId);
      setPendingChapters((prev) => new Set(prev).add(chapterId));

      try {
        const token = await getToken();
        await setChapterCardsStatus({
          explorerId,
          chapterId,
          status,
          headers: { Authorization: `Bearer ${token}` },
        });

        const chapterCards = cardsByPlaceId[chapterId] ?? [];
        setCardStatuses((prev) => {
          const next = { ...prev };
          for (const c of chapterCards) next[String(c.id)] = status;
          return next;
        });
      } catch (e) {
        console.error(`Could not mark chapter ${chapterId} as ${status}`, e);
      } finally {
        pendingChaptersRef.current.delete(chapterId);
        setPendingChapters((prev) => {
          const next = new Set(prev);
          next.delete(chapterId);
          return next;
        });
      }
    },
    [cardsByPlaceId, explorerId, getToken],
  );

  const onMarkAllOwned = useCallback(
    async (chapterId: number) => setChapterStatus(chapterId, 'owned'),
    [setChapterStatus],
  );

  const onMarkAllDuplicated = useCallback(
    async (chapterId: number) => setChapterStatus(chapterId, 'duplicated'),
    [setChapterStatus],
  );

  const isChapterPending = useCallback(
    (chapterId: number) => pendingChapters.has(chapterId),
    [pendingChapters],
  );

  return {
    isLoading,
    sortLatest,
    setSortLatest,

    chaptersData,
    cardStatuses,

    onSelectCard,
    onResetCard,
    onMarkAllOwned,
    onMarkAllDuplicated,
    isChapterPending,

    lettersWithChapters,
    scrollToLetter,

    listRef,

    reload,
  };
}
