import { Text, View, TouchableOpacity, useWindowDimensions } from "react-native";
import { Link } from "expo-router";
import { homeStyles } from "@/src/assets/styles/home.styles";
import { authStyles } from "@/src/assets/styles/auth.styles";

export default function HeroCard() {
    const { height } = useWindowDimensions();

    return (
      <View style={[homeStyles.heroCard, { minHeight: Math.round(height * 0.26) }]}>
        <Text style={homeStyles.heroTitle}>Swap WeCards easily</Text>

        <Text style={homeStyles.heroSubtitle}>
          Log your cards, find what you need, and trade with other users.
        </Text>

        <View style={homeStyles.microMeta}>
          <Text style={homeStyles.microMetaText}>
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
  );
}