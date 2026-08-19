import { Text, View } from 'react-native';
import { Image } from 'expo-image';

import { homeStyles } from '@/src/assets/styles/home.styles';
import LandingButton from '@/src/features/home/components/LandingButton';
import { CTA_CARD_BACKGROUND } from '@/src/features/home/data/ctaCardBackground';

/**
 * The section's closing call to action. It is not a sixth step, so it does not
 * look like one: a photographic background under a warm scrim.
 *
 * The art is one fixed image rather than a chapter pulled from the API, so the
 * card looks the same on every launch and the scrim can be tuned against a
 * known picture instead of against whatever the backend happens to return.
 */
export default function StepCtaCard() {
  return (
    <View style={homeStyles.ctaCard}>
      <Image
        source={CTA_CARD_BACKGROUND}
        style={homeStyles.ctaCardImage}
        contentFit="cover"
        transition={300}
      />
      <View style={homeStyles.ctaCardScrim} />

      <View style={homeStyles.ctaCardContent}>
        <Text style={homeStyles.ctaCardTitle}>
          Ready to fill the gaps in your collection?
        </Text>
        <LandingButton
          label="Create an account"
          href="/sign-up"
          style={homeStyles.stepCtaButton}
        />
      </View>
    </View>
  );
}
