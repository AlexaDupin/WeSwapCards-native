import { authStyles } from "@/src/assets/styles/auth.styles";
import { homeStyles } from "@/src/assets/styles/home.styles";
import PageLoader from "@/src/components/PageLoader";
import TopBar from "@/src/features/home/components/TopBar";
import HeroCard from "@/src/features/home/components/HeroCard";
import LatestChaptersRow from "@/src/features/chapters/components/LatestChaptersRow";
import HowItWorks from "@/src/features/home/components/HowItWorks";

import { useAuth } from "@clerk/clerk-expo";
import { Link, Redirect } from "expo-router";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <PageLoader />;
  if (isSignedIn) return <Redirect href={"/(tabs)/cards"} />;

  return (
    <View style={homeStyles.screen}>
      <ScrollView
        contentContainerStyle={homeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <TopBar />

        <HeroCard />

        <View style={homeStyles.sectionBlock}>
          <LatestChaptersRow limit={5} />
        </View>

        <HowItWorks />

        <View style={homeStyles.footerCta}>
          <Link href="/sign-up" asChild>
            <TouchableOpacity style={authStyles.button}>
              <Text style={authStyles.buttonText}>Create an account</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}