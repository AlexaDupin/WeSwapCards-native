import { Pressable, Text, View } from 'react-native';
import { Link } from 'expo-router';

import { homeStyles } from '@/src/assets/styles/home.styles';
import HeroCardStack from '@/src/features/home/components/HeroCardStack';
import LandingButton from '@/src/features/home/components/LandingButton';
import SocialProofPill from '@/src/features/home/components/SocialProofPill';
import type { LatestChapter } from '@/src/features/chapters/types/chapters.types';

type Props = {
  /** The latest chapters; the first two become the floating card stack. */
  chapters: LatestChapter[];
  /** Jumps the page to the How it works section. */
  onSeeHowItWorks: () => void;
};

export default function Hero({ chapters, onSeeHowItWorks }: Props) {
  return (
    <View style={homeStyles.hero}>
      <SocialProofPill />

      <Text style={homeStyles.heroTitle}>
        Your duplicates are someone else’s{' '}
        <Text style={homeStyles.heroTitleAccent}>missing card.</Text>
      </Text>

      <Text style={homeStyles.heroLede}>
        Track the WeCards you own, spot the ones you’re missing, and get matched
        with collectors whose spares fill your gaps.
      </Text>

      <LandingButton label="Create an account" href="/sign-up" glow />

      <Pressable
        onPress={onSeeHowItWorks}
        style={homeStyles.quietLink}
        accessibilityRole="link"
        accessibilityHint="Scrolls down to the How it works section"
      >
        <Text style={homeStyles.quietLinkText}>See how it works ↓</Text>
      </Pressable>

      <Text style={homeStyles.heroFineprint}>
        Free to join. Not affiliated with the official WeWard app.
      </Text>

      <HeroCardStack chapters={chapters} />

      <Text style={homeStyles.signInLine}>
        Already have an account?{' '}
        <Link href="/sign-in" style={homeStyles.signInLink}>
          Sign in
        </Link>
      </Text>
    </View>
  );
}
