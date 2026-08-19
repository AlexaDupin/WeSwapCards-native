import { Text, View } from 'react-native';

import { homeStyles } from '@/src/assets/styles/home.styles';
import StepCard from '@/src/features/home/components/StepCard';
import StepCtaCard from '@/src/features/home/components/StepCtaCard';
import { howItWorksSteps } from '@/src/features/home/data/howItWorksSteps';

export default function HowItWorks() {
  return (
    <View style={homeStyles.section}>
      <View style={homeStyles.sectionHead}>
        <Text style={homeStyles.eyebrow}>How it works</Text>
        <Text style={homeStyles.sectionTitle}>
          From a pile of duplicates to a completed collection.
        </Text>
      </View>

      <View style={homeStyles.stepList}>
        {howItWorksSteps.map((step, index) => (
          <StepCard
            key={step.title}
            step={index + 1}
            title={step.title}
            text={step.text}
            tone={step.tone}
          />
        ))}

        <StepCtaCard />
      </View>
    </View>
  );
}
