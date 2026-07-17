import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/src/constants/Colors';
import type { SwapChapter } from '@/src/features/swap/types/SwapTypes';

type Props = {
  chapters: SwapChapter[];
  selectedChapterId: number | null;
  selectedChapterName: string | null;
  loading: boolean;
  onSelectChapter: (chapterId: number | null) => void;
};

/** Where the floating list sits, in window coordinates. */
type Anchor = {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
};

const GAP = 6;
const SCREEN_MARGIN = 12;
const MAX_LIST_HEIGHT = 280;
// Below this, the gap under the field is too cramped to be worth using and the
// list flips above instead.
const MIN_LIST_HEIGHT = 160;

export default function ChapterSelector({
  chapters,
  selectedChapterId,
  selectedChapterName,
  loading,
  onSelectChapter,
}: Props) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const selectorRef = useRef<View>(null);

  const label = useMemo(() => {
    if (loading) return 'Loading chapters…';
    return selectedChapterName ?? 'Select a chapter';
  }, [loading, selectedChapterName]);

  const canClear = selectedChapterId != null && !loading;
  const isPlaceholder = !loading && selectedChapterName == null;

  const close = useCallback(() => setOpen(false), []);

  // The list renders in a Modal so it can float over the opportunities below:
  // the selector's parent does not clip on iOS, but an absolutely positioned
  // list would fall outside its bounds and stop receiving touches on Android.
  // A Modal owns the whole window, so it has to be told where the field is.
  // Measuring is re-done on every open because scrolling moves the field
  // without re-laying it out. Opening never waits on the result: until an
  // anchor lands the list is held invisible rather than painted at 0,0.
  const openList = useCallback(() => {
    selectorRef.current?.measureInWindow((x, y, width, height) => {
      const window = Dimensions.get('window');
      const spaceBelow = window.height - (y + height) - GAP - SCREEN_MARGIN;
      const spaceAbove = y - GAP - SCREEN_MARGIN;
      const flip = spaceBelow < MIN_LIST_HEIGHT && spaceAbove > spaceBelow;

      setAnchor({
        left: x,
        width,
        maxHeight: Math.min(MAX_LIST_HEIGHT, flip ? spaceAbove : spaceBelow),
        ...(flip
          ? { bottom: window.height - y + GAP }
          : { top: y + height + GAP }),
      });
    });
    setOpen(true);
  }, []);

  return (
    <View>
      <View style={styles.row}>
        <Pressable
          ref={selectorRef}
          onPress={open ? close : openList}
          disabled={loading}
          style={({ pressed }) => [
            styles.selector,
            open && styles.selectorOpen,
            pressed && !loading ? styles.selectorPressed : null,
          ]}
          accessibilityRole="combobox"
          accessibilityLabel="Select a chapter"
          accessibilityHint="Opens the list of chapters"
          accessibilityState={{ expanded: open, disabled: loading }}
          accessibilityValue={{ text: selectedChapterName ?? 'None selected' }}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.selectorText,
              isPlaceholder && styles.selectorTextPlaceholder,
            ]}
          >
            {label}
          </Text>

          {loading ? (
            <ActivityIndicator size="small" />
          ) : (
            <View style={styles.chevronWrap}>
              <Ionicons
                name={open ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={Colors.textPrimary}
              />
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            close();
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
          <Text
            style={[styles.clearText, !canClear && styles.clearTextDisabled]}
          >
            Clear
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={close}
      >
        {/* The scrim sits behind the list rather than wrapping it, so taps on
            the list never bubble out to dismiss and its scroll stays free. */}
        <Pressable
          style={styles.scrim}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close the chapter list"
        />

        <View
          style={[
            styles.listWrap,
            anchor != null
              ? {
                  left: anchor.left,
                  width: anchor.width,
                  maxHeight: anchor.maxHeight,
                  top: anchor.top,
                  bottom: anchor.bottom,
                }
              : styles.listWrapUnmeasured,
          ]}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {chapters.map((item, index) => {
              const selected = item.id === selectedChapterId;
              return (
                <React.Fragment key={String(item.id)}>
                  {index > 0 ? <View style={styles.separator} /> : null}
                  <Pressable
                    onPress={() => {
                      close();
                      onSelectChapter(item.id);
                    }}
                    style={({ pressed }) => [
                      styles.item,
                      selected && styles.itemSelected,
                      pressed && styles.itemPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.itemText,
                        selected && styles.itemTextSelected,
                      ]}
                    >
                      {item.name}
                    </Text>
                    {selected ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primary}
                      />
                    ) : null}
                  </Pressable>
                </React.Fragment>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
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
  selectorOpen: {
    borderColor: Colors.primary,
  },
  selectorPressed: {
    opacity: 0.9,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    color: Colors.textPrimary,
  },
  selectorTextPlaceholder: {
    color: 'rgba(0,0,0,0.45)',
    fontWeight: '500',
  },
  chevronWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
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
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  listWrap: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
    padding: 10,
    // Lifts the list off the content it now covers.
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  listWrapUnmeasured: {
    opacity: 0,
  },
  separator: {
    height: 6,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
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
    flex: 1,
  },
  itemTextSelected: {
    fontWeight: '800',
  },
});
