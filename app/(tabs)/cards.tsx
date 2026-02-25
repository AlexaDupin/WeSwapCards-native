import { Text, View, Pressable } from 'react-native';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';

import PageLoader from '@/src/components/PageLoader';
import { SignOutButton } from '@/src/components/SignOutButton';

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
      <SignOutButton />

      <View style={styles.controlsRow}>
        <Text style={styles.pageTitle}>My cards</Text>

        <View style={styles.sortSegmentWrap} accessibilityRole="tablist">
          <Pressable
            onPress={() => setSortLatest(false)}
            style={({ pressed }) => [
              styles.sortSegment,
              !sortLatest && styles.sortSegmentActive,
              pressed && styles.sortSegmentPressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: !sortLatest }}
          >
            <Text
              style={[
                styles.sortSegmentText,
                !sortLatest && styles.sortSegmentTextActive,
              ]}
            >
              A–Z
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSortLatest(true)}
            style={({ pressed }) => [
              styles.sortSegment,
              sortLatest && styles.sortSegmentActive,
              pressed && styles.sortSegmentPressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: sortLatest }}
          >
            <Text
              style={[
                styles.sortSegmentText,
                sortLatest && styles.sortSegmentTextActive,
              ]}
            >
              Latest
            </Text>
          </Pressable>
        </View>
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
