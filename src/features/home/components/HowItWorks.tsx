import React from "react";
import { Text, View } from "react-native";
import { Link } from "expo-router";
import StepRow from "@/src/features/home/components/StepRow";
import { howItWorksSteps } from "@/src/features/home/data/howItWorksSteps";
import { homeStyles } from "@/src/assets/styles/home.styles";

export default function HowItWorks() {
  return (
    <View style={homeStyles.sectionBlock}>
      <View style={homeStyles.sectionHeaderRow}>
        <Text style={homeStyles.sectionTitle}>How it works</Text>

        <Link href="/sign-up" style={homeStyles.sectionAction}>
          Get started
        </Link>
      </View>

      <View style={homeStyles.stepsCard}>
        {howItWorksSteps.map((step, idx) => {
          const isLast = idx === howItWorksSteps.length - 1;

          return (
            <React.Fragment key={step.title}>
              <StepRow Icon={step.Icon} title={step.title} subtitle={step.subtitle} />
              {!isLast && <View style={homeStyles.stepDivider} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}
