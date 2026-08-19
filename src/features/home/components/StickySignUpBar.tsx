import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { homeStyles } from '@/src/assets/styles/home.styles';
import LandingButton from '@/src/features/home/components/LandingButton';

/** Content height, excluding the device's bottom inset (added on top). */
export const STICKY_BAR_BASE_HEIGHT = 84;

type Props = {
  scrollY: SharedValue<number>;
  /** The hero's bottom offset. The bar appears once scrolling past it. */
  heroBottom: SharedValue<number>;
};

/**
 * A sign-up bar that slides up once the hero's own call to action has scrolled
 * away, so the page always has one on screen. It has no web counterpart; it is
 * the native pattern for a landing page whose only job is conversion.
 *
 * The two buttons are never visible at the same time, since the trigger is the
 * hero leaving the viewport.
 */
export default function StickySignUpBar({ scrollY, heroBottom }: Props) {
  const insets = useSafeAreaInsets();
  const height = STICKY_BAR_BASE_HEIGHT + insets.bottom;

  const animatedStyle = useAnimatedStyle(() => {
    const shown = heroBottom.value > 0 && scrollY.value > heroBottom.value;

    return {
      opacity: withTiming(shown ? 1 : 0, { duration: 180 }),
      transform: [
        { translateY: withTiming(shown ? 0 : height, { duration: 220 }) },
      ],
    };
  });

  return (
    <Animated.View
      style={[homeStyles.stickyBar, animatedStyle]}
      // Never steals a tap while it is off screen.
      pointerEvents="box-none"
    >
      {/* Edge-to-edge Android draws the gesture bar over the screen, so the
          bottom inset is reserved here rather than assumed away. Same approach
          as the tab bar in app/(tabs)/_layout.tsx. */}
      <View
        style={[
          homeStyles.stickyBarFill,
          { paddingBottom: 12 + insets.bottom },
        ]}
      >
        <LandingButton label="Create an account" href="/sign-up" />
      </View>
    </Animated.View>
  );
}
