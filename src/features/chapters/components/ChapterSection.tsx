// src/features/cards/components/ChapterSection.tsx
import React from "react";
import { Text, View } from "react-native";
import type { CardItemData, CardStatus } from "@/src/features/cards/types/CardItemType";
import CardItem from "@/src/features/cards/components/CardItem";
import ChapterProgress from "./ChapterProgress";
import ChapterKebabMenu from "./ChapterKebabMenu";
import { styles } from "@/src/assets/styles/cards.styles";

type Props = {
  chapterId: number;
  chapterName: string;
  cards: CardItemData[];
  ownedOrDuplicatedCount: number;
  statuses: Record<number, CardStatus>;
  onSelectCard: (cardId: number) => void;
  onResetCard?: (cardId: number) => void;
  onMarkAllOwned?: (chapterId: number) => void;
  onMarkAllDuplicated?: (chapterId: number) => void;
  isPending?: boolean;
  readOnly?: boolean;
};

export default function ChapterSection({
  chapterId,
  chapterName,
  cards,
  ownedOrDuplicatedCount,
  statuses,
  onSelectCard,
  onResetCard,
  onMarkAllOwned,
  onMarkAllDuplicated,
  isPending = false,
  readOnly = false,
}: Props) {
  return (
    <View style={styles.chapter}>
      <View style={styles.chapterHeaderRow}>
        <Text style={styles.chapterTitle}>{chapterName}</Text>

        <ChapterKebabMenu
          disabled={isPending || readOnly}
          onMarkAllOwned={onMarkAllOwned ? () => onMarkAllOwned(chapterId) : undefined}
          onMarkAllDuplicated={onMarkAllDuplicated ? () => onMarkAllDuplicated(chapterId) : undefined}
        />
      </View>

      <ChapterProgress value={ownedOrDuplicatedCount} max={9} />

      <View style={styles.cardsList} accessibilityRole="list">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            item={card}
            status={statuses[card.id] || "default"}
            onSelect={() => onSelectCard(card.id)}
            reset={onResetCard ? () => onResetCard(card.id) : undefined}
            readOnly={readOnly}
          />
        ))}
      </View>
    </View>
  );
}
