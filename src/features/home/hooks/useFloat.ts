import { useEffect } from 'react';
import {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type FloatOptions = {
  /** One half-cycle, in ms. The full loop is twice this. */
  duration: number;
  /** Tilt at rest and at the top of the drift, in degrees. */
  rotateFrom: number;
  rotateTo: number;
  /** Vertical drift, in px. Negative moves the card up. */
  translateTo: number;
};

/**
 * The hero cards' slow drift, a port of the web's `wscFloat` / `wscFloat2`
 * keyframes (front/src/components/Home/homeStyles.scss).
 *
 * With Reduce Motion on, the card holds its resting tilt and never animates.
 */
export function useFloat({
  duration,
  rotateFrom,
  rotateTo,
  translateTo,
}: FloatOptions) {
  const progress = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [duration, progress, reducedMotion]);

  return useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [0, translateTo]) },
      {
        rotate: `${interpolate(progress.value, [0, 1], [rotateFrom, rotateTo])}deg`,
      },
    ],
  }));
}
