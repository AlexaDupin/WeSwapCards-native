import { Text, View } from 'react-native';

import { homeStyles } from '@/src/assets/styles/home.styles';
import type { StepTone } from '@/src/features/home/data/howItWorksSteps';

type Props = {
  /** 1-based position, shown in the badge. */
  step: number;
  title: string;
  text: string;
  tone: StepTone;
};

export default function StepCard({ step, title, text, tone }: Props) {
  const isTeal = tone === 'teal';

  return (
    <View style={homeStyles.stepCard}>
      <View style={[homeStyles.stepBadge, isTeal && homeStyles.stepBadgeTeal]}>
        <Text
          style={[
            homeStyles.stepBadgeText,
            isTeal && homeStyles.stepBadgeTextTeal,
          ]}
        >
          {step}
        </Text>
      </View>

      <Text style={homeStyles.stepTitle}>{title}</Text>
      <Text style={homeStyles.stepText}>{text}</Text>
    </View>
  );
}
