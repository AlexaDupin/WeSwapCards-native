import Chat from '@/src/assets/images/chatdeal.svg';
import Dashboard from '@/src/assets/images/dashboard.svg';
import Report from '@/src/assets/images/report.svg';
import Search from '@/src/assets/images/search.svg';
import Users from '@/src/assets/images/users.svg';
import { authStyles } from "@/src/assets/styles/auth.styles";
import { homeStyles } from "@/src/assets/styles/home.styles";
import PageLoader from '@/src/components/PageLoader';
import StepsCard from "@/src/features/home/components/StepsCard";
import { useAuth } from '@clerk/clerk-expo';
import { Link, Redirect } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import LatestChaptersRow from "@/src/features/chapters/components/LatestChaptersRow";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { height } = useWindowDimensions();

  if (!isLoaded) return <PageLoader />;
  
  if (isSignedIn) {
    return <Redirect href={'/(tabs)/cards'} />
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={homeStyles.scrollContent}
      >
        <View style={[homeStyles.container, { minHeight: height * 0.85}]}>
          <View style={{ alignItems: "center" }}>
            <Image
              source={require("@/src/assets/images/favImage.png")}
              style={{ width: 100, height: 100 }}            
            />
          </View>
          
          <View>
            <Text style={homeStyles.title}>Welcome to WeSwapCards!</Text>
            <Text style={homeStyles.paragraph}>
              You use WeWard and want to exchange WeCards easily?
            </Text>
            <Text style={homeStyles.paragraph}>
              This is the place for you!
            </Text>
            <Text style={homeStyles.paragraph}>
              Create an account and start searching for the cards you need!
            </Text>
            <Text style={homeStyles.disclaimer}>
              This platform is <Text style={{ fontWeight: 'bold' }}>not</Text> affiliated in any way with the official WeWard app.
            </Text>
            
            <View style={{ width: "100%", marginTop: 10 }}>
              <Link href="/sign-up" asChild>
                <TouchableOpacity style={authStyles.button}>
                  <Text style={authStyles.buttonText}>Create an account</Text>
                </TouchableOpacity>
              </Link>

              <View style={{ marginTop: 6, alignItems: "center" }}>
                <Text style={{ opacity: 0.75, marginBottom: 10 }}>
                  Already have an account?{" "}
                  <Link href="/sign-in" style={{ fontWeight: "700" }}>
                    Sign in
                  </Link>
                </Text>
              </View>
            </View>
          </View>
        </View>

        <LatestChaptersRow/>

        <View>
          <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 20, marginTop: 40 }}>
            How it works
          </Text>
          <StepsCard image={Report} text="Log all the cards you have" />
          <StepsCard image={Search} text="Find the card you need" />
          <StepsCard image={Users} text="Browse users who have this card" />
          <StepsCard image={Chat} text="Chat with them and find a deal" />
          <StepsCard image={Dashboard} text="Keep track of your requests in a dashboard" />
        </View>

      </ScrollView>
    </View>
  )
}
