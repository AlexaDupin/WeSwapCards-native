import { useMemo } from "react";
import { Text, View, useWindowDimensions } from "react-native";
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
  const { width: screenWidth } = useWindowDimensions();

  // Match your chapterListContent paddingHorizontal: 16 (left) + 16 (right)
  const chapterListPadding = 32;

  // If you add extra padding in cardsList, include it here; otherwise keep 0
  const cardsListPadding = 0;

  const GAP = 8;
  const COLS = 9;

  const cardWidth = useMemo(() => {
    const usable = screenWidth - chapterListPadding - cardsListPadding;
    const totalGaps = GAP * (COLS - 1);
    const w = Math.floor((usable - totalGaps) / COLS);
    return Math.max(28, w); // safety floor so it never becomes tiny
  }, [screenWidth]);

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
            cardWidth={cardWidth}
          />
        ))}
      </View>
    </View>
  );
}
