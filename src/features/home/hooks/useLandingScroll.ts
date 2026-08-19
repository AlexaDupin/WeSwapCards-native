import { useCallback, useRef } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import type Animated from 'react-native-reanimated';
import {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';

// Leaves the section heading clear of the top edge after the jump.
const SCROLL_TO_OFFSET = 12;

/**
 * The landing page's scroll state, shared by every part of the screen that
 * reacts to it: the reveal wrappers, the sticky sign-up bar, and the hero's
 * "See how it works" jump.
 *
 * `scrollY` and `heroBottom` are shared values so the sticky bar and the
 * reveals can animate entirely on the UI thread, without a render per frame.
 */
export function useLandingScroll() {
  const scrollRef = useRef<Animated.ScrollView>(null);

  const scrollY = useSharedValue(0);
  const heroBottom = useSharedValue(0);

  // Read by an imperative scrollTo rather than by an animation, so a plain ref
  // is enough and a shared value would buy nothing.
  const howItWorksY = useRef(0);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const onHeroLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { y, height } = event.nativeEvent.layout;
      heroBottom.value = y + height;
    },
    [heroBottom],
  );

  const onHowItWorksLayout = useCallback((event: LayoutChangeEvent) => {
    howItWorksY.current = event.nativeEvent.layout.y;
  }, []);

  const scrollToHowItWorks = useCallback(() => {
    scrollRef.current?.scrollTo({
      y: Math.max(0, howItWorksY.current - SCROLL_TO_OFFSET),
      animated: true,
    });
  }, []);

  return {
    scrollRef,
    scrollY,
    scrollHandler,
    heroBottom,
    onHeroLayout,
    onHowItWorksLayout,
    scrollToHowItWorks,
  };
}
