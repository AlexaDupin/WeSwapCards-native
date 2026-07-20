import { homeStyles } from '@/src/assets/styles/home.styles';
import PageLoader from '@/src/components/PageLoader';
import TopBar from '@/src/features/home/components/TopBar';
import HeroCard from '@/src/features/home/components/HeroCard';
import LatestChaptersRow from '@/src/features/chapters/components/LatestChaptersRow';
import HowItWorks from '@/src/features/home/components/HowItWorks';

import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { Image, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '@/src/features/onboarding/hooks/useOnboarding';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { status: onboardingStatus } = useOnboarding();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // First-launch onboarding sits strictly ahead of the auth branch: fresh
  // installs see the intro carousel once; the loading guard avoids flashing
  // the landing page while the persisted flag is read.
  if (onboardingStatus === 'loading') return <PageLoader />;
  if (onboardingStatus === 'unseen') return <Redirect href="/onboarding" />;

  if (!isLoaded) return <PageLoader />;
  if (isSignedIn) return <Redirect href={'/(tabs)/cards'} />;

  return (
    <View style={homeStyles.screen}>
      <ScrollView
        contentContainerStyle={[
          homeStyles.scrollContent,
          { paddingTop: 24 + insets.top, paddingBottom: insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <TopBar />

        <HeroCard />

        <Image
          source={require('@/src/assets/images/illustrations/LandingPageImage.png')}
          style={[
            homeStyles.landingImage,
            { width, height: width * (941 / 1672) },
          ]}
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />

        <View style={homeStyles.sectionBlock}>
          <LatestChaptersRow limit={5} />
        </View>

        <View style={{ height: 16 }} />

        <HowItWorks />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
