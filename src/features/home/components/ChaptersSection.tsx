import { Text, View } from 'react-native';
import { Link } from 'expo-router';

import { homeStyles } from '@/src/assets/styles/home.styles';
import CatalogueCard from '@/src/features/home/components/CatalogueCard';
import ChapterCarousel from '@/src/features/home/components/ChapterCarousel';
import type { ChapterRow } from '@/src/features/home/hooks/useLandingChapters';

type Props = {
  latest: ChapterRow;
  vintage: ChapterRow;
};

export default function ChaptersSection({ latest, vintage }: Props) {
  return (
    <View style={homeStyles.section}>
      <View style={homeStyles.sectionHead}>
        <Text style={homeStyles.eyebrow}>Chapters</Text>
        <Text style={homeStyles.sectionTitle}>
          Every chapter, all swappable.
        </Text>
        <Link href="/sign-up" style={homeStyles.sectionLink}>
          Browse all chapters →
        </Link>
      </View>

      <ChapterCarousel title="The latest chapters" row={latest} />
      <ChapterCarousel title="Ephemeral vintage series" row={vintage} />

      <CatalogueCard />
    </View>
  );
}
