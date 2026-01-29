// src/features/cards/components/ChaptersList.tsx
import React from "react";
import { FlatList } from "react-native";
import type { CardStatus } from "@/src/features/cards/types/CardItemType";
import type { ChapterUI } from "@/src/features/cards/screens/Cards";
import ChapterSection from "./ChapterSection";
import { styles } from "@/src/assets/styles/cards.styles";

type Props = {
  chaptersData: ChapterUI[];
  statuses: Record<number, CardStatus>;
  onSelectCard: (cardId: number) => void;
  onResetCard?: (cardId: number) => void;
  onMarkAllOwned?: (chapterId: number) => void;
  onMarkAllDuplicated?: (chapterId: number) => void;
  isChapterPending?: (chapterId: number) => boolean;
  readOnly?: boolean;
};

export default function ChaptersList({
  chaptersData,
  statuses,
  onSelectCard,
  onResetCard,
  onMarkAllOwned,
  onMarkAllDuplicated,
  isChapterPending,
  readOnly = false,
}: Props) {
  return (
    <FlatList
      data={chaptersData}
      keyExtractor={(c) => String(c.chapterId)}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.chapterListContent}
      renderItem={({ item }) => (
        <ChapterSection
          chapterId={item.chapterId}
          chapterName={item.chapterName}
          cards={item.cards}
          ownedOrDuplicatedCount={item.ownedOrDuplicatedCount}
          statuses={statuses}
          onSelectCard={onSelectCard}
          onResetCard={onResetCard}
          onMarkAllOwned={onMarkAllOwned}
          onMarkAllDuplicated={onMarkAllDuplicated}
          isPending={isChapterPending?.(item.chapterId) ?? false}
          readOnly={readOnly}
        />
      )}
    />
  );
}
