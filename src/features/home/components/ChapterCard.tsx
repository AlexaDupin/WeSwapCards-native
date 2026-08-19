import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

import PressableScale from '@/src/components/PressableScale';
import { homeStyles } from '@/src/assets/styles/home.styles';
import { CHAPTER_IMAGE_PLACEHOLDER } from '@/src/features/chapters/constants';
import type { LatestChapter } from '@/src/features/chapters/types/chapters.types';

type Props = {
  chapter: LatestChapter;
};

export default function ChapterCard({ chapter }: Props) {
  return (
    <Link href="/sign-up" asChild>
      <PressableScale
        style={homeStyles.chapterCard}
        accessibilityRole="button"
        accessibilityLabel={`${chapter.name}. Sign up to browse this chapter.`}
      >
        <Image
          source={{ uri: chapter.image_url || CHAPTER_IMAGE_PLACEHOLDER }}
          style={homeStyles.chapterCardImage}
          contentFit="cover"
          transition={200}
        />

        <View style={homeStyles.chapterCardBody}>
          <Text numberOfLines={2} style={homeStyles.chapterCardTitle}>
            {chapter.name}
          </Text>
        </View>
      </PressableScale>
    </Link>
  );
}
