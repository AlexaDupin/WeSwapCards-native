import { forwardRef } from 'react';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type View,
  type ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = PressableProps & {
  style?: StyleProp<ViewStyle>;
  /** Press-down target scale. Defaults to 0.97. */
  scaleTo?: number;
  /** Fire a light haptic on press. Defaults to true. */
  haptics?: boolean;
};

/**
 * A Pressable that springs down slightly while pressed and fires a light
 * haptic, giving a native, tactile feel. Forwards all Pressable props so it
 * works as a drop-in `<Link asChild>` target.
 */
const PressableScale = forwardRef<View, PressableScaleProps>(
  ({ style, scaleTo = 0.97, haptics = true, onPress, ...rest }, ref) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    return (
      <AnimatedPressable
        ref={ref}
        style={[style, animatedStyle]}
        onPressIn={() => {
          scale.value = withTiming(scaleTo, { duration: 90 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 14, stiffness: 220 });
        }}
        onPress={(e) => {
          if (haptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
              () => {},
            );
          }
          onPress?.(e);
        }}
        {...rest}
      />
    );
  },
);

PressableScale.displayName = 'PressableScale';

export default PressableScale;
