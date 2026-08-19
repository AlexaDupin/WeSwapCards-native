import { useCallback } from 'react';
import {
  useWindowDimensions,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

type Props = {
  /** The page's scroll offset, from useLandingScroll. */
  scrollY: SharedValue<number>;
  /** Stagger against sibling reveals, in ms. The web uses 90ms steps. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
  children: React.ReactNode;
};

const DURATION = 400;
const TRANSLATE_FROM = 24;

// How far down the viewport a section's top must come before it reveals. The
// web's IntersectionObserver uses a -10% inset and a 0.25 ratio; this is the
// same idea expressed against the scroll offset.
const TRIGGER_RATIO = 0.85;

/**
 * Fades and lifts its children in the first time they scroll into view, the
 * native counterpart of the web landing page's IntersectionObserver reveal
 * (front/src/components/Home/Home.jsx).
 *
 * Two deliberate differences from the web. It never hides again on the way back
 * up, because content that vanishes when you scroll up reads as a bug on a
 * phone. And it is driven by the scroll offset rather than by a mount-time
 * entering animation, because every section of this page mounts at once and a
 * mount animation would be over before you ever scrolled to it.
 *
 * With Reduce Motion on, children render at their final state immediately.
 */
export default function Reveal({
  scrollY,
  delay = 0,
  style,
  onLayout,
  children,
}: Props) {
  const { height } = useWindowDimensions();
  const reducedMotion = useReducedMotion();

  const progress = useSharedValue(reducedMotion ? 1 : 0);
  // Until layout runs the section is treated as far below the fold.
  const top = useSharedValue(Number.POSITIVE_INFINITY);

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      top.value = event.nativeEvent.layout.y;
      onLayout?.(event);
    },
    [onLayout, top],
  );

  useAnimatedReaction(
    () => top.value - scrollY.value < height * TRIGGER_RATIO,
    (isInView) => {
      if (!isInView || progress.value !== 0) return;
      progress.value = withDelay(delay, withTiming(1, { duration: DURATION }));
    },
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * TRANSLATE_FROM }],
  }));

  return (
    <Animated.View
      style={reducedMotion ? style : [style, animatedStyle]}
      onLayout={handleLayout}
    >
      {children}
    </Animated.View>
  );
}
