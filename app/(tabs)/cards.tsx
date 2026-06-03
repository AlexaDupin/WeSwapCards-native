import { Text, View } from 'react-native';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';

import PageLoader from '@/src/components/PageLoader';
import SegmentedToggle from '@/src/components/SegmentedToggle';

import ChaptersList from '@/src/features/chapters/components/ChaptersList';
import AZNav from '@/src/features/chapters/components/AZNav';
import { styles } from '@/src/assets/styles/cards.styles';

import { useCardsScreen } from '@/src/features/cards/hooks/useCardsScreen';

export default function Cards() {
  const { explorerId } = useExplorer();
  const cards = useCardsScreen({ explorerId });

  if (!explorerId) return <PageLoader />;

  const {
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
  } = cards;

  return (
    <View style={styles.cardsScreen}>
      <View style={styles.controlsRow}>
        <Text style={styles.pageTitle}>My cards</Text>

        <SegmentedToggle
          options={[
            { value: 'az', label: 'A–Z' },
            { value: 'latest', label: 'Latest' },
          ]}
          value={sortLatest ? 'latest' : 'az'}
          onChange={(v) => setSortLatest(v === 'latest')}
        />
      </View>

      <View style={styles.azWrap}>
        <AZNav
          onSelect={scrollToLetter}
          lettersWithContent={lettersWithChapters}
        />
      </View>

      <ChaptersList
        listRef={listRef}
        chaptersData={chaptersData}
        statuses={cardStatuses}
        onSelectCard={onSelectCard}
        onResetCard={onResetCard}
        onMarkAllOwned={onMarkAllOwned}
        onMarkAllDuplicated={onMarkAllDuplicated}
        isChapterPending={isChapterPending}
        readOnly={false}
      />
    </View>
  );
}
