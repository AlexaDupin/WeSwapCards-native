import React, { useLayoutEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const PLACEHOLDER =
  'https://res.cloudinary.com/dwf28prby/image/upload/v1760480793/placeholder.jpg';

type Chapter = {
  id: number;
  name: string;
  image_url?: string | null;
};

type Props = {
  chapters: Chapter[];
  loading: boolean;
  selectedChapterId?: number | null;
  onSelectChapter: (chapterId: number) => void;
};

const TILE_WIDTH = 82;
const TILE_GAP = 12;

export default function LatestChaptersMiniTiles({
  chapters,
  loading,
  selectedChapterId,
  onSelectChapter,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);

  useLayoutEffect(() => {
    if (selectedChapterId == null) return;
    const index = chapters.findIndex((c) => c.id === selectedChapterId);
    if (index <= 0) return;
    scrollRef.current?.scrollTo({
      x: index * (TILE_WIDTH + TILE_GAP),
      animated: false,
    });
  }, [selectedChapterId, chapters]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!chapters.length) return null;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {chapters.map((chapter) => {
          const isSelected = chapter.id === selectedChapterId;

          return (
            <Pressable
              key={chapter.id}
              onPress={() => onSelectChapter(chapter.id)}
              style={({ pressed }) => [
                styles.tile,
                isSelected && styles.tileSelected,
                pressed && styles.tilePressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Open ${chapter.name}`}
            >
              <Image
                source={{ uri: chapter.image_url || PLACEHOLDER }}
                style={styles.image}
                resizeMode="cover"
              />

              <View style={styles.overlay} />

              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.label}>
                {chapter.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  loadingWrap: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  row: {
    paddingRight: 4,
    gap: 12,
  },
  tile: {
    position: 'relative',
    width: 82,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tileSelected: {
    transform: [{ scale: 0.98 }],
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  tilePressed: {
    opacity: 0.92,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  label: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 6,
    color: '#fff',
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
  },
});
