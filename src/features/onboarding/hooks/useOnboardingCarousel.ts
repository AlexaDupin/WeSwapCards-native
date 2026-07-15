import { useCallback, useRef, useState } from 'react';
import type { FlatList, ViewToken } from 'react-native';
import { router } from 'expo-router';

import { useOnboarding } from '@/src/features/onboarding/hooks/useOnboarding';
import type { OnboardingSlide } from '@/src/features/onboarding/data/onboardingSlides';

/**
 * Orchestrates the onboarding carousel: tracks the visible slide, advances on
 * "Next", and finishes (Skip or "Get started") by persisting the seen flag and
 * replacing the route — `replace`, not `push`, so onboarding can't be returned
 * to with a back gesture.
 */
export function useOnboardingCarousel(slideCount: number) {
  const { markSeen } = useOnboarding();

  const listRef = useRef<FlatList<OnboardingSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const isLastSlide = activeIndex >= slideCount - 1;

  const finish = useCallback(() => {
    markSeen();
    router.replace('/');
  }, [markSeen]);

  const goNext = useCallback(() => {
    if (isLastSlide) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  }, [isLastSlide, activeIndex, finish]);

  // FlatList requires a stable identity for these two across renders, hence refs.
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const first = viewableItems[0];
      if (first?.index != null) setActiveIndex(first.index);
    },
  ).current;
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  return {
    listRef,
    activeIndex,
    isLastSlide,
    goNext,
    finish,
    onViewableItemsChanged,
    viewabilityConfig,
  };
}
