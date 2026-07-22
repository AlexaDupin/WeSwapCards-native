import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import type { ListRenderItem } from 'react-native';
import type { CardStatus } from '@/src/features/cards/types/CardItemType';
import type { ChapterUI } from '@/src/features/cards/hooks/useCardsScreen';
import ChapterSection from './ChapterSection';
import { styles } from '@/src/assets/styles/cards.styles';

type Props = {
  chaptersData: ChapterUI[];
  statuses: Record<number, CardStatus>;
  onSelectCard: (cardId: number) => void;
  onResetCard?: (cardId: number) => void;
  onMarkAllOwned?: (chapterId: number) => void;
  onMarkAllDuplicated?: (chapterId: number) => void;
  isChapterPending?: (chapterId: number) => boolean;
  readOnly?: boolean;
  listRef?: React.RefObject<FlatList<ChapterUI> | null>;
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
  listRef,
}: Props) {
  const onScrollToIndexFailed = useCallback(
    (info: { index: number; averageItemLength: number }) => {
      // The target row may not be measured yet when jumping far off-screen.
      // Jump to an estimated offset, then retry once it has been laid out.
      listRef?.current?.scrollToOffset({
        offset: info.averageItemLength * info.index,
        animated: true,
      });
      setTimeout(() => {
        if (chaptersData.length <= info.index) return;
        listRef?.current?.scrollToIndex({ index: info.index, animated: true });
      }, 100);
    },
    [listRef, chaptersData.length],
  );

  const renderItem = useCallback<ListRenderItem<ChapterUI>>(
    ({ item }) => (
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
    ),
    [
      statuses,
      onSelectCard,
      onResetCard,
      onMarkAllOwned,
      onMarkAllDuplicated,
      isChapterPending,
      readOnly,
    ],
  );

  return (
    <FlatList
      ref={listRef}
      data={chaptersData}
      keyExtractor={(c) => String(c.chapterId)}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.chapterListContent}
      renderItem={renderItem}
      onScrollToIndexFailed={onScrollToIndexFailed}
      // Modest virtualization tuning: render fewer rows per batch/window so no
      // single JS commit does too much work. Kept mild — the real fix for the
      // per-tap churn was stabilizing getToken in useCardsScreen.
      initialNumToRender={5}
      maxToRenderPerBatch={3}
      windowSize={5}
      updateCellsBatchingPeriod={50}
    />
  );
}
