import React, { useMemo } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import type {
  CardItemData,
  CardStatus,
} from '@/src/features/cards/types/CardItemType';
import CardItem from '@/src/features/cards/components/CardItem';
import ChapterProgress from './ChapterProgress';
import ChapterKebabMenu from './ChapterKebabMenu';
import { styles } from '@/src/assets/styles/cards.styles';

type Props = {
  chapterId: number;
  chapterName: string;
  cards: CardItemData[];
  ownedOrDuplicatedCount: number;
  statuses: Record<number, CardStatus>;
  onSelectCard: (cardId: number) => void;
  onResetCard?: ((cardId: number) => void) | undefined;
  onMarkAllOwned?: ((chapterId: number) => void) | undefined;
  onMarkAllDuplicated?: ((chapterId: number) => void) | undefined;
  isPending?: boolean;
  readOnly?: boolean;
};

function ChapterSection({
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
          onMarkAllOwned={
            onMarkAllOwned ? () => onMarkAllOwned(chapterId) : undefined
          }
          onMarkAllDuplicated={
            onMarkAllDuplicated
              ? () => onMarkAllDuplicated(chapterId)
              : undefined
          }
        />
      </View>

      <ChapterProgress value={ownedOrDuplicatedCount} max={9} />

      <View style={styles.cardsList} accessibilityRole="list">
        {cards.map((card) => (
          <CardItem
            key={card.id}
            item={card}
            status={statuses[card.id] || 'default'}
            onSelect={onSelectCard}
            reset={onResetCard}
            readOnly={readOnly}
            cardWidth={cardWidth}
          />
        ))}
      </View>
    </View>
  );
}

// Custom comparator: the parent recreates the whole `statuses` object on every
// card tap, which would defeat a shallow-compare memo and re-render every
// mounted section at once (the cause of VirtualizedList's "slow to update"
// warning). Re-render a section only when something it actually displays
// changes — including the status of one of *its own* cards.
function areEqual(prev: Props, next: Props) {
  if (
    prev.chapterId !== next.chapterId ||
    prev.chapterName !== next.chapterName ||
    prev.ownedOrDuplicatedCount !== next.ownedOrDuplicatedCount ||
    prev.cards !== next.cards ||
    prev.isPending !== next.isPending ||
    prev.readOnly !== next.readOnly ||
    prev.onSelectCard !== next.onSelectCard ||
    prev.onResetCard !== next.onResetCard ||
    prev.onMarkAllOwned !== next.onMarkAllOwned ||
    prev.onMarkAllDuplicated !== next.onMarkAllDuplicated
  ) {
    return false;
  }

  // cards is reference-equal here (checked above), so iterating next.cards is
  // safe and covers exactly this chapter's slice of the statuses map.
  for (const card of next.cards) {
    if (
      (prev.statuses[card.id] ?? 'default') !==
      (next.statuses[card.id] ?? 'default')
    ) {
      return false;
    }
  }

  return true;
}

export default React.memo(ChapterSection, areEqual);
