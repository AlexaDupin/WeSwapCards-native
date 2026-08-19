import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { Link, type Href } from 'expo-router';

import PressableScale from '@/src/components/PressableScale';
import { homeStyles } from '@/src/assets/styles/home.styles';

type Props = {
  label: string;
  href: Href;
  /** `primary` is the filled orange pill, `outline` the bordered one. */
  variant?: 'primary' | 'outline';
  /** The hero's button alone carries the accent glow. */
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * The landing page's call to action, in the web's two CustomButton variants
 * (front/src/components/CustomButton). Every one of them routes to sign-up:
 * the screen is a conversion funnel and there is no guest browsing mode.
 */
export default function LandingButton({
  label,
  href,
  variant = 'primary',
  glow = false,
  style,
}: Props) {
  const isPrimary = variant === 'primary';

  return (
    <Link href={href} asChild>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={label}
        // Flattened to a single object on purpose. Link's `asChild` sends the
        // child through Radix's Slot, whose mergeProps does
        // `{ ...slotStyle, ...childStyle }`; spreading a style *array* there
        // yields `{0:…, 1:…}` and every style is silently dropped, which is how
        // this button lost its orange background and rendered as bare white
        // text. Anything under a `<Link asChild>` must pass one style object.
        style={StyleSheet.flatten([
          isPrimary ? homeStyles.primaryCta : homeStyles.outlineCta,
          glow ? homeStyles.primaryCtaGlow : null,
          style,
        ])}
      >
        <Text
          style={
            isPrimary ? homeStyles.primaryCtaLabel : homeStyles.outlineCtaLabel
          }
        >
          {label}
        </Text>
      </PressableScale>
    </Link>
  );
}
