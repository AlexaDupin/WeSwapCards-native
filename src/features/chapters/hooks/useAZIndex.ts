import { useCallback, useMemo } from "react";
import type { FlatList } from "react-native";

type ChapterForAZ = { id: number; name: string };

function getFirstLetter(name: string) {
  const trimmed = (name ?? "").trim();
  const L = trimmed[0]?.toUpperCase() ?? "";
  return L >= "A" && L <= "Z" ? L : "#";
}

export default function useAZIndexFlatList(params: {
  chapters: ChapterForAZ[];
  listRef: React.RefObject<FlatList<any>>;
  enabled?: boolean;
}) {
  const { chapters, listRef, enabled = true } = params;

  const letterToIndex = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < chapters.length; i++) {
      const L = getFirstLetter(chapters[i].name);
      if (L === "#") continue;
      if (!map.has(L)) map.set(L, i); // first occurrence
    }
    return map;
  }, [chapters]);

  const lettersWithChapters = useMemo(() => {
    const s = new Set<string>();
    for (const ch of chapters) {
      const L = getFirstLetter(ch.name);
      if (L !== "#") s.add(L);
    }
    return s;
  }, [chapters]);

  const scrollToLetter = useCallback(
    (letter: string) => {
      if (!enabled) return;
      const index = letterToIndex.get(letter);
      if (index == null) return;

      listRef.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0,
      });
    },
    [enabled, letterToIndex, listRef]
  );

  return { lettersWithChapters, scrollToLetter };
}
