import { Text, View } from 'react-native';

import { homeStyles } from '@/src/assets/styles/home.styles';
import LandingButton from '@/src/features/home/components/LandingButton';

export default function CatalogueCard() {
  return (
    <View style={homeStyles.catalogueCard}>
      <Text style={homeStyles.catalogueTitle}>And all the other chapters</Text>
      <Text style={homeStyles.catalogueText}>
        New chapters are added as they land in WeWard, so your tracker never
        falls behind.
      </Text>
      <LandingButton
        label="Explore the catalogue"
        href="/sign-up"
        variant="outline"
      />
    </View>
  );
}
