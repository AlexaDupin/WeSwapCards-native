import { useCallback } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SafeScreen from '@/src/components/SafeScreen';
import PressableScale from '@/src/components/PressableScale';
import { Colors } from '@/src/constants/Colors';
import {
  onboardingSlides,
  type OnboardingSlide,
} from '@/src/features/onboarding/data/onboardingSlides';
import { useOnboardingCarousel } from '@/src/features/onboarding/hooks/useOnboardingCarousel';

const OnboardingScreen = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const {
    listRef,
    activeIndex,
    isLastSlide,
    goNext,
    finish,
    onViewableItemsChanged,
    viewabilityConfig,
  } = useOnboardingCarousel(onboardingSlides.length);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<OnboardingSlide>) => (
      <View style={[styles.slide, { width }]}>
        {/* Only the illustration flexes; the text block below is fixed height so
            headline, body, dots and CTA never shift between slides. */}
        <View style={styles.illustrationZone}>
          <Image
            source={item.image}
            contentFit="contain"
            style={styles.illustration}
          />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.headline}>{item.headline}</Text>
          <Text style={styles.body}>{item.body}</Text>
        </View>
      </View>
    ),
    [width],
  );

  return (
    <SafeScreen>
      <View style={styles.screen}>
        <View style={styles.topRow}>
          <Pressable
            onPress={finish}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={onboardingSlides}
          keyExtractor={(item) => item.key}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />

        {/* SafeScreen only pads the top inset; edge-to-edge Android draws the
            nav/gesture bar over the screen, so reserve the bottom inset here —
            same approach as the tab bar in app/(tabs)/_layout.tsx. */}
        <View style={[styles.footer, { paddingBottom: 24 + insets.bottom }]}>
          <View style={styles.dotsRow}>
            {onboardingSlides.map((slide, index) => (
              <View
                key={slide.key}
                style={[
                  styles.dot,
                  index === activeIndex ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>

          <PressableScale onPress={goNext} style={styles.cta}>
            <Text style={styles.ctaLabel}>
              {isLastSlide ? 'Get started' : 'Next'}
            </Text>
          </PressableScale>
        </View>
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.onboardingBackground,
  },

  topRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  skip: {
    fontSize: 16,
    color: Colors.onboardingMuted,
  },

  slide: {
    paddingHorizontal: 24,
  },
  illustrationZone: {
    flex: 1,
    justifyContent: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },

  textBlock: {
    height: 150,
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.onboardingText,
  },
  body: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: '85%',
    color: Colors.onboardingMuted,
  },

  footer: {
    paddingHorizontal: 24,
    // paddingBottom is set inline: 24 + the device's bottom safe-area inset.
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 7,
    backgroundColor: Colors.lightPrimary,
  },

  cta: {
    backgroundColor: Colors.darkerPrimary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  ctaLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default OnboardingScreen;
