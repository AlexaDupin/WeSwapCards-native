import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Text, View, Pressable, FlatList } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

import PageLoader from "@/src/components/PageLoader";
import { SignOutButton } from "@/src/components/SignOutButton";
import { axiosInstance } from "@/src/lib/axiosInstance";

import type { CardItemData, CardStatus } from "@/src/features/cards/types/CardItemType";
import type { ChapterData } from "@/src/features/chapters/types/ChapterType";

import ChaptersList from "@/src/features/chapters/components/ChaptersList";
import { styles } from "@/src/assets/styles/cards.styles";

import AZNav from "@/src/features/chapters/components/AZNav";
import useAZIndex from "@/src/features/chapters/hooks/useAZIndex";

type GetChaptersResponse = { places: ChapterData[] };
type GetCardsResponse = { cards: CardItemData[] };
type GetCardStatusesResponse = { statuses: Record<string, CardStatus> };
type UpsertCardResponse = { explorerId: number; cardId: number; duplicate: boolean; changed: boolean };

export type ChapterUI = {
  chapterId: number;
  chapterName: string;
  cards: CardItemData[];
  ownedOrDuplicatedCount: number;
};

type BulkChapterStatus = "owned" | "duplicated";

export default function Cards() {
  const [cardStatuses, setCardStatuses] = useState<Record<string, CardStatus>>({});
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [cards, setCards] = useState<CardItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortLatest, setSortLatest] = useState(false);

  // TODO: replace with your real explorer id source
  const explorerId: number = 134;

  const { getToken } = useAuth();

  const [pendingChapters, setPendingChapters] = useState<Set<number>>(new Set());

  const listRef = useRef<FlatList<ChapterUI>>(null);

  const fetchAllChapters = useCallback(async () => {
    const response = await axiosInstance.get<GetChaptersResponse>("/places");
    setChapters(response.data.places);
  }, []);

  const fetchAllCards = useCallback(async () => {
    const token = await getToken();
    const response = await axiosInstance.get<GetCardsResponse>("/cards", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCards(response.data.cards);
  }, [getToken]);

  const fetchAllCardStatuses = useCallback(
    async (id: number) => {
      try {
        const token = await getToken();
        const response = await axiosInstance.get<GetCardStatusesResponse>(`/cards/statuses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const statuses = response.data?.statuses;
        setCardStatuses((prev) => {
          if (!statuses || typeof statuses !== "object") return prev;
          if (Object.keys(statuses).length === 0) return prev;
        
          return statuses;
        });
      } catch (e) {
        console.error("Error fetching statuses", e);
      }
    },
    [getToken]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await Promise.all([fetchAllChapters(), fetchAllCards(), fetchAllCardStatuses(explorerId)]);
      } catch (e) {
        console.error("Cards screen load failed", e);
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
    for (const c of cards) {
      (map[c.place_id] ??= []).push(c);
    }
    return map;
  }, [cards]);

  const chaptersData: ChapterUI[] = useMemo(() => {
    const base = chapters.map((ch) => {
      const chapterCards = cardsByPlaceId[ch.id] ?? [];
      const ownedOrDuplicatedCount = chapterCards.reduce((acc, card) => {
        const s = cardStatuses[String(card.id)] ?? "default";
        return s === "owned" || s === "duplicated" ? acc + 1 : acc;
      }, 0);

      return {
        chapterId: ch.id,
        chapterName: ch.name,
        cards: chapterCards,
        ownedOrDuplicatedCount,
      };
    });

    const collator = new Intl.Collator(undefined, { sensitivity: "base", numeric: true });
    const sortedAlpha = [...base].sort((a, b) => collator.compare(a.chapterName, b.chapterName));

    if (!sortLatest) return sortedAlpha;
    return [...base].sort((a, b) => b.chapterId - a.chapterId);
  }, [chapters, cardsByPlaceId, cardStatuses, sortLatest]);

  // ✅ A–Z indexing based on the currently visible list
  const chaptersForAZ = useMemo(
    () => chaptersData.map(({ chapterId, chapterName }) => ({ id: chapterId, name: chapterName })),
    [chaptersData]
  );

  const { lettersWithChapters, scrollToLetter } = useAZIndex({
    chapters: chaptersForAZ,
    listRef,
    enabled: true, // if you prefer: enabled: !sortLatest
  });

  const getNextStatus = (current: CardStatus): CardStatus => {
    switch (current) {
      case "default":
        return "owned";
      case "owned":
        return "duplicated";
      case "duplicated":
        return "owned";
      default:
        return "owned";
    }
  };

  const upsertCard = useCallback(
    async (cardId: number, duplicate: boolean) => {
      const token = await getToken();

      const response = await axiosInstance.put<UpsertCardResponse>(
        `/explorercards/${explorerId}/cards/${cardId}`,
        { duplicate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setCardStatuses((prev) => ({
          ...prev,
          [String(cardId)]: response.data.duplicate ? "duplicated" : "owned",
        }));
      }
    },
    [explorerId, getToken]
  );

  const handleSelect = useCallback(
    async (cardId: number) => {
      const currentStatus = cardStatuses[String(cardId)] || "default";
      const nextStatus = getNextStatus(currentStatus);

      if (nextStatus === "owned") return upsertCard(cardId, false);
      if (nextStatus === "duplicated") return upsertCard(cardId, true);
    },
    [cardStatuses, upsertCard]
  );

  const reset = useCallback(async (cardId: number) => {
    const current = cardStatuses[String(cardId)] || 'default';
    if (current === 'default') return;

      try {
        const token = await getToken();
        const response = await axiosInstance.delete(`/explorercards/${explorerId}/cards/${cardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setCardStatuses((prev) => ({ ...prev, [String(cardId)]: "default" }));
        } else {
          console.warn("Unexpected reset status:", response.status);
        }
      } catch (error) {
        console.error("Error during card deletion", error);
      }
    },
    [explorerId, getToken]
  );

  const setChapterStatus = useCallback(
    async (chapterId: number, status: BulkChapterStatus) => {
      if (pendingChapters.has(chapterId)) return;

      setPendingChapters((prev) => {
        const next = new Set(prev);
        next.add(chapterId);
        return next;
      });

      try {
        const token = await getToken();
        await axiosInstance.post(
          `/explorercards/${explorerId}/chapters/${chapterId}/status`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        const chapterCards = cardsByPlaceId[chapterId] ?? [];
        setCardStatuses((prev) => {
          const next = { ...prev };
          for (const c of chapterCards) next[String(c.id)] = status;
          return next;
        });
      } catch (e) {
        console.error(`Could not mark chapter ${chapterId} as ${status}`, e);
      } finally {
        setPendingChapters((prev) => {
          const next = new Set(prev);
          next.delete(chapterId);
          return next;
        });
      }
    },
    [pendingChapters, cardsByPlaceId, explorerId, getToken]
  );

  const markAllOwnedInChapter = useCallback(
    async (chapterId: number) => setChapterStatus(chapterId, "owned"),
    [setChapterStatus]
  );

  const markAllDuplicatedInChapter = useCallback(
    async (chapterId: number) => setChapterStatus(chapterId, "duplicated"),
    [setChapterStatus]
  );

  const isChapterPending = useCallback(
    (chapterId: number) => pendingChapters.has(chapterId),
    [pendingChapters]
  );

  if (isLoading) return <PageLoader />;

  return (
    <View style={styles.cardsScreen}>
      <SignOutButton />
      <Text style={styles.pageTitle}>My cards</Text>

      <View style={styles.controlsRow}>
        <Text style={styles.controlsLabel}>Sort</Text>

        <Pressable
          onPress={() => setSortLatest((v) => !v)}
          style={({ pressed }) => [
            styles.latestPill,
            sortLatest && styles.latestPillActive,
            pressed && styles.latestPillPressed,
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: sortLatest }}
        >
          <Text style={[styles.latestPillText, sortLatest && styles.latestPillTextActive]}>
            {sortLatest ? "Latest ✓" : "Latest"}
          </Text>
        </Pressable>
      </View>

      {/* ✅ A–Z bar */}
      <View style={styles.azWrap}>
        <AZNav onSelect={scrollToLetter} lettersWithContent={lettersWithChapters} />
      </View>

      {/* ✅ Existing list, now scrollable via ref */}
      <ChaptersList
        listRef={listRef}
        chaptersData={chaptersData}
        statuses={cardStatuses}
        onSelectCard={handleSelect}
        onResetCard={reset}
        onMarkAllOwned={markAllOwnedInChapter}
        onMarkAllDuplicated={markAllDuplicatedInChapter}
        isChapterPending={isChapterPending}
        readOnly={false}
      />
    </View>
  );
}