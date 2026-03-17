import React from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { SwapChapter } from '@/src/features/swap/types/SwapTypes';

const PLACEHOLDER =
  'https://res.cloudinary.com/dwf28prby/image/upload/v1760480793/placeholder.jpg';

type Props = {
  chapters: SwapChapter[];
  loading: boolean;
  onSelectChapter: (chapterId: number) => void;
};

export default function LatestChaptersBanners({
  chapters,
  loading,
  onSelectChapter,
}: Props) {
  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator />
      </View>
    );
  }

  if (chapters.length === 0) return null;

  return (
    <View style={styles.container}>
      {chapters.map((chapter) => (
        <Pressable
          key={String(chapter.id)}
          onPress={() => onSelectChapter(chapter.id)}
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Open ${chapter.name}`}
        >
          <ImageBackground
            source={{ uri: chapter.image_url || PLACEHOLDER }}
            style={styles.image}
            imageStyle={styles.imageInner}
            resizeMode="cover"
          >
            <View style={styles.overlay}>
              <Text numberOfLines={1} style={styles.title}>
                {chapter.name}
              </Text>
            </View>
          </ImageBackground>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    marginBottom: 12,
  },
  loadingWrap: {
    paddingVertical: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.94,
  },
  image: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    backgroundColor: '#e9e9e9',
  },
  imageInner: {
    borderRadius: 12,
  },
  overlay: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
