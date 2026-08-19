import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import Animated from 'react-native-reanimated';

import { homeStyles } from '@/src/assets/styles/home.styles';
import { useFloat } from '@/src/features/home/hooks/useFloat';
import { CHAPTER_IMAGE_PLACEHOLDER } from '@/src/features/chapters/constants';
import type { LatestChapter } from '@/src/features/chapters/types/chapters.types';

// Concentric translucent circles standing in for the web's
// radial-gradient(circle, rgba(240,122,26,.14), transparent 70%). React Native
// has no radial gradient and no gradient library is installed, and three nested
// circles read as the same soft halo for a fraction of the cost.
const GLOW_RINGS = [
  { size: 320, opacity: 0.05 },
  { size: 240, opacity: 0.05 },
  { size: 170, opacity: 0.04 },
];

type Props = {
  /** The first two chapters from /chapters/latest. May be empty while loading. */
  chapters: LatestChapter[];
};

/**
 * The hero's signature visual: two tilted chapter cards drifting over an orange
 * halo, ported from the web landing page's .home-hero__art.
 *
 * It is decorative, so it is hidden from screen readers exactly as the web
 * marks it aria-hidden. The real chapter names are already announced by the
 * carousels further down.
 */
export default function HeroCardStack({ chapters }: Props) {
  const firstFloat = useFloat({
    duration: 7000,
    rotateFrom: -6,
    rotateTo: -4,
    translateTo: -14,
  });
  const secondFloat = useFloat({
    duration: 8000,
    rotateFrom: 7,
    rotateTo: 5,
    translateTo: -10,
  });

  const cards = [
    { chapter: chapters[0], style: firstFloat, offset: false },
    { chapter: chapters[1], style: secondFloat, offset: true },
  ];

  return (
    <View
      style={homeStyles.heroArt}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {GLOW_RINGS.map((ring) => (
        <View
          key={ring.size}
          style={[
            homeStyles.heroGlow,
            {
              width: ring.size,
              height: ring.size,
              borderRadius: ring.size / 2,
              opacity: ring.opacity,
            },
          ]}
        />
      ))}

      <View style={homeStyles.heroStack}>
        {cards.map(({ chapter, style, offset }, index) => (
          <Animated.View
            key={index}
            style={[
              homeStyles.heroCard,
              offset && homeStyles.heroCardOffset,
              style,
            ]}
          >
            <View style={homeStyles.heroCardArt}>
              {chapter ? (
                <Image
                  source={{
                    uri: chapter.image_url || CHAPTER_IMAGE_PLACEHOLDER,
                  }}
                  style={homeStyles.heroCardArtImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : null}
            </View>

            {/* The label keeps its height while empty so the stack does not
                jump when the chapter names arrive. */}
            <Text numberOfLines={1} style={homeStyles.heroCardLabel}>
              {chapter?.name ?? ' '}
            </Text>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
