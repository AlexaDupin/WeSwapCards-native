import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { SwapChapter } from '@/src/features/swap/types/SwapTypes';

type Props = {
  chapters: SwapChapter[];
  selectedChapterId: number | null;
  selectedChapterName: string | null;
  loading: boolean;
  onSelectChapter: (chapterId: number | null) => void;
};

export default function ChapterSelector({
  chapters,
  selectedChapterId,
  selectedChapterName,
  loading,
  onSelectChapter,
}: Props) {
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    if (loading) return 'Loading chapters…';
    return selectedChapterName ?? 'Select a chapter';
  }, [loading, selectedChapterName]);

  const canClear = selectedChapterId != null && !loading;

  return (
    <View>
      <View style={styles.row}>
        <Pressable
          onPress={() => setOpen((v) => !v)}
          disabled={loading}
          style={({ pressed }) => [
            styles.selector,
            pressed && !loading ? styles.selectorPressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Select a chapter"
        >
          <Text numberOfLines={1} style={styles.selectorText}>
            {label}
          </Text>
          {loading ? <ActivityIndicator size="small" /> : null}
        </Pressable>

        <Pressable
          onPress={() => {
            setOpen(false);
            onSelectChapter(null);
          }}
          disabled={!canClear}
          style={({ pressed }) => [
            styles.clear,
            (!canClear || pressed) && styles.clearPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Clear chapter selection"
        >
          <Text style={[styles.clearText, !canClear && styles.clearTextDisabled]}>
            Clear
          </Text>
        </Pressable>
      </View>

      {open ? (
        <View style={styles.listWrap}>
          <FlatList<SwapChapter>
            data={chapters}
            keyExtractor={(c) => String(c.id)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = item.id === selectedChapterId;
              return (
                <Pressable
                  onPress={() => {
                    setOpen(false);
                    onSelectChapter(item.id);
                  }}
                  style={({ pressed }) => [
                    styles.item,
                    selected && styles.itemSelected,
                    pressed && styles.itemPressed,
                  ]}
                >
                  <Text style={[styles.itemText, selected && styles.itemTextSelected]}>
                    {item.name}
                  </Text>
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
            style={{ maxHeight: 260 }}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selector: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  selectorPressed: {
    opacity: 0.9,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  clear: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  clearPressed: {
    opacity: 0.7,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
  },
  clearTextDisabled: {
    opacity: 0.4,
  },
  listWrap: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
    padding: 10,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  itemPressed: {
    opacity: 0.9,
  },
  itemSelected: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  itemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemTextSelected: {
    fontWeight: '800',
  },
});

