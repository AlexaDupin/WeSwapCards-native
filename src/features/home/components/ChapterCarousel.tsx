import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { homeStyles } from '@/src/assets/styles/home.styles';
import ChapterCard from '@/src/features/home/components/ChapterCard';
import type { ChapterRow } from '@/src/features/home/hooks/useLandingChapters';
import type { LatestChapter } from '@/src/features/chapters/types/chapters.types';

// Must match homeStyles.chapterCard's width and carouselContent's gap, or the
// snap lands between cards.
const CARD_WIDTH = 200;
const CARD_GAP = 12;

type Props = {
  title: string;
  row: ChapterRow;
};

/**
 * One horizontally snapping row of chapters, the native form of the web's
 * scroll-snap carousel. The web hides its arrows on coarse pointers, so swipe
 * is already the intended interaction and there is nothing to port.
 */
export default function ChapterCarousel({ title, row }: Props) {
  const { items, loading, error } = row;

  // A row that loaded successfully but empty disappears entirely, heading and
  // all, exactly as the web does. That is what makes the vintage row vanish
  // cleanly when the backend has no VINTAGE_COLLECTOR_IDS configured.
  if (!loading && !error && items.length === 0) return null;

  return (
    <View style={homeStyles.carouselRow}>
      <Text style={homeStyles.carouselTitle}>{title}</Text>

      {loading ? (
        <View style={homeStyles.carouselStateWrap}>
          <ActivityIndicator />
        </View>
      ) : error ? (
        <View style={homeStyles.carouselStateWrap}>
          <Text style={homeStyles.carouselError}>{error}</Text>
        </View>
      ) : (
        <FlatList<LatestChapter>
          style={homeStyles.carouselBleed}
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ChapterCard chapter={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={homeStyles.carouselContent}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          snapToAlignment="start"
          decelerationRate="fast"
        />
      )}
    </View>
  );
}
