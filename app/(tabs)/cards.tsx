import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';

import PageLoader from '@/src/components/PageLoader';
import SegmentedToggle from '@/src/components/SegmentedToggle';

import ChaptersList from '@/src/features/chapters/components/ChaptersList';
import AZNav from '@/src/features/chapters/components/AZNav';
import CardsHelpModal from '@/src/features/cards/components/CardsHelpModal';
import TipBubble from '@/src/features/tips/components/TipBubble';
import { styles } from '@/src/assets/styles/cards.styles';

import { useCardsScreen } from '@/src/features/cards/hooks/useCardsScreen';

export default function Cards() {
  const { explorerId } = useExplorer();

  if (!explorerId) return <PageLoader />;

  return <CardsScreen explorerId={explorerId} />;
}

function CardsScreen({ explorerId }: { explorerId: number }) {
  const cards = useCardsScreen({ explorerId });
  const [helpVisible, setHelpVisible] = useState(false);

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
        <View style={styles.titleRow}>
          <Text style={styles.pageTitle}>My cards</Text>

          <Pressable
            onPress={() => setHelpVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="How it works"
            style={({ pressed }) => [
              styles.kebabButton,
              pressed && styles.kebabPressed,
            ]}
          >
            <Ionicons
              name="help-circle-outline"
              size={20}
              color="rgba(0,0,0,0.45)"
            />
          </Pressable>
        </View>

        <SegmentedToggle
          options={[
            { value: 'az', label: 'A–Z' },
            { value: 'latest', label: 'Latest' },
          ]}
          value={sortLatest ? 'latest' : 'az'}
          onChange={(v) => setSortLatest(v === 'latest')}
        />
      </View>

      <View>
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

      <CardsHelpModal
        visible={helpVisible}
        onClose={() => setHelpVisible(false)}
      />

      <TipBubble tipKey="cards" />
    </View>
  );
}
