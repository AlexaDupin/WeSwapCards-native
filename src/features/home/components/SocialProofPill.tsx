import { Text, View } from 'react-native';

import { homeStyles } from '@/src/assets/styles/home.styles';

// Both figures are confirmed community totals and are kept in step with the web
// landing page and docs/store-listing.md. Refresh all three together.
const PROOF = '1,000+ collectors joined already · 16,000+ swaps so far';

export default function SocialProofPill() {
  return (
    <View style={homeStyles.pill}>
      <View style={homeStyles.pillDot} />
      <Text style={homeStyles.pillText}>{PROOF}</Text>
    </View>
  );
}
