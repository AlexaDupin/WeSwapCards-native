import Chat from '@/assets/images/chatdeal.svg';
import Dashboard from '@/assets/images/dashboard.svg';
import Report from '@/assets/images/report.svg';
import Search from '@/assets/images/search.svg';
import Users from '@/assets/images/users.svg';
import { authStyles } from "@/assets/styles/auth.styles";
import { homeStyles } from "@/assets/styles/home.styles";
import PageLoader from '@/components/PageLoader';
import StepsCard from "@/components/StepsCard";
import { useAuth } from '@clerk/clerk-expo';
import { Link, Redirect } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <PageLoader />;
  
  if (isSignedIn) {
    return <Redirect href={'/(tabs)/cards'} />
  }

  return (
  <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ScrollView
        contentContainerStyle={homeStyles.scrollContent}
      >
        <View style={homeStyles.container}>
            <Image
              source={require("../assets/images/favImage.png")}
              style={{ width: 130, height: 130 }}            
            />
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

            <Link href="/sign-up" asChild>
              <TouchableOpacity style={authStyles.button            }>
                <Text style={authStyles.buttonText}>Create an account</Text>
              </TouchableOpacity>
            </Link>

        </View>
      
        <View style={homeStyles.container}>
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
