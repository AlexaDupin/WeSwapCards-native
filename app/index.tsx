import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';

import { homeStyles } from '@/src/assets/styles/home.styles';
import PageLoader from '@/src/components/PageLoader';
import ChaptersSection from '@/src/features/home/components/ChaptersSection';
import Hero from '@/src/features/home/components/Hero';
import HowItWorks from '@/src/features/home/components/HowItWorks';
import LandingFooter from '@/src/features/home/components/LandingFooter';
import Reveal from '@/src/features/home/components/Reveal';
import StickySignUpBar, {
  STICKY_BAR_BASE_HEIGHT,
} from '@/src/features/home/components/StickySignUpBar';
import TopBar from '@/src/features/home/components/TopBar';
import { useLandingChapters } from '@/src/features/home/hooks/useLandingChapters';
import { useLandingScroll } from '@/src/features/home/hooks/useLandingScroll';
import { useOnboarding } from '@/src/features/onboarding/hooks/useOnboarding';

// The web staggers sibling reveals by 90ms; the sections inherit the same step.
const REVEAL_STEP = 90;

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { status: onboardingStatus } = useOnboarding();
  const insets = useSafeAreaInsets();

  const {
    scrollRef,
    scrollY,
    scrollHandler,
    heroBottom,
    onHeroLayout,
    onHowItWorksLayout,
    scrollToHowItWorks,
  } = useLandingScroll();

  // Only an anonymous visitor past onboarding ever sees this page; everyone
  // else is redirected below, so nobody else needs its data.
  const showsLanding =
    onboardingStatus === 'seen' && isLoaded && isSignedIn === false;
  const { latest, vintage } = useLandingChapters(showsLanding);

  // First-launch onboarding sits strictly ahead of the auth branch: fresh
  // installs see the intro carousel once; the loading guard avoids flashing
  // the landing page while the persisted flag is read.
  if (onboardingStatus === 'loading') return <PageLoader />;
  if (onboardingStatus === 'unseen') return <Redirect href="/onboarding" />;

  if (!isLoaded) return <PageLoader />;
  if (isSignedIn) return <Redirect href={'/(tabs)/cards'} />;

  return (
    <View style={homeStyles.screen}>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={[
          homeStyles.scrollContent,
          {
            paddingTop: 24 + insets.top,
            // Clears the sticky sign-up bar so the footer links stay tappable.
            paddingBottom: STICKY_BAR_BASE_HEIGHT + insets.bottom + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TopBar />

        <Reveal scrollY={scrollY} onLayout={onHeroLayout}>
          <Hero
            chapters={latest.items.slice(0, 2)}
            onSeeHowItWorks={scrollToHowItWorks}
          />
        </Reveal>

        <Reveal
          scrollY={scrollY}
          delay={REVEAL_STEP}
          style={homeStyles.sectionGap}
          onLayout={onHowItWorksLayout}
        >
          <HowItWorks />
        </Reveal>

        <Reveal
          scrollY={scrollY}
          delay={REVEAL_STEP * 2}
          style={homeStyles.sectionGap}
        >
          <ChaptersSection latest={latest} vintage={vintage} />
        </Reveal>

        <LandingFooter />
      </Animated.ScrollView>

      <StickySignUpBar scrollY={scrollY} heroBottom={heroBottom} />
    </View>
  );
}
