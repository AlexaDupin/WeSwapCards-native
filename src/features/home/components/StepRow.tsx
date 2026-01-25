import React from "react";
import { View, Text } from "react-native";
import { homeStyles } from "@/src/assets/styles/home.styles";

type StepRowProps = {
  Icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
};

export default function StepRow({ Icon, title, subtitle }: StepRowProps) {
  return (
    <View style={homeStyles.stepRow}>
      <View style={homeStyles.stepIconWrap}>
        <Icon width={50} height={50} />
      </View>

      <View style={homeStyles.stepTextWrap}>
        <Text style={homeStyles.stepTitle}>{title}</Text>
        <Text style={homeStyles.stepSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}
