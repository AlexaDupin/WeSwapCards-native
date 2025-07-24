import { Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
import { homeStyles } from "../assets/styles/home.styles";
import { styles } from "../assets/styles/styles";
import { Link, useRouter } from 'expo-router'
import StepsCard from "../components/StepsCard.tsx";

import Report from '../assets/images/report.svg';
import Search from '../assets/images/search.svg';
import Users from '../assets/images/users.svg';
import Chat from '../assets/images/chatdeal.svg';
import Dashboard from '../assets/images/dashboard.svg';

export default function Index() {
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
              <TouchableOpacity style={styles.button            }>
                <Text style={styles.buttonText}>Create an account</           Text>
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
  );
}
