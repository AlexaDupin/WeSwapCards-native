import { authStyles } from "@/src/assets/styles/auth.styles";
import { homeStyles } from "@/src/assets/styles/home.styles";
import PageLoader from "@/src/components/PageLoader";
import LatestChaptersRow from "@/src/features/chapters/components/LatestChaptersRow";
import HowItWorks from "@/src/features/home/components/HowItWorks";

import { useAuth } from "@clerk/clerk-expo";
import { Link, Redirect } from "expo-router";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { height } = useWindowDimensions();

  if (!isLoaded) return <PageLoader />;
  if (isSignedIn) return <Redirect href={"/(tabs)/cards"} />;

  return (
    <View style={homeStyles.screen}>
      <ScrollView
        contentContainerStyle={homeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={homeStyles.topBar}>
          <View style={homeStyles.brandRow}>
            <Image
              source={require("@/src/assets/images/favImage.png")}
              style={homeStyles.brandIcon}
            />
            <Text style={homeStyles.brandName}>WeSwapCards</Text>
          </View>
        </View>

        <View style={[homeStyles.heroCard, { minHeight: Math.round(height * 0.26) }]}>
          <Text style={homeStyles.heroTitle}>Swap WeCards easily</Text>

          <Text style={homeStyles.heroSubtitle}>
            Log your cards, find what you need, and trade with other users.
          </Text>

          <View style={homeStyles.microPill}>
            <Text style={homeStyles.microPillText}>
              Community-driven{" "}
              <Text style={homeStyles.dot}>•</Text> Not affiliated with WeWard
            </Text>
          </View>

          <View style={homeStyles.heroCtas}>
            <Link href="/sign-up" asChild>
              <TouchableOpacity style={authStyles.button}>
                <Text style={authStyles.buttonText}>Create an account</Text>
              </TouchableOpacity>
            </Link>

            <Text style={homeStyles.signInLine}>
              Already have an account?{" "}
              <Link href="/sign-in" style={homeStyles.signInLink}>
                Sign in
              </Link>
            </Text>
          </View>
        </View>

        <View style={homeStyles.sectionBlock}>
          <LatestChaptersRow limit={5} />
        </View>


        <View style={homeStyles.sectionBlock}>
          <HowItWorks />

          <View style={{ marginTop: 14 }}>
            <Link href="/sign-up" asChild>
              <TouchableOpacity style={authStyles.button}>
                <Text style={authStyles.buttonText}>Create an account</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </View>
  );
}