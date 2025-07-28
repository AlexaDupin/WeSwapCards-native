import { Text, View, TouchableOpacity, ScrollView, Image, FlatList } from "react-native";
import { homeStyles } from "../assets/styles/home.styles";
// import { styles } from "../assets/styles/styles";
import { Link, useRouter } from 'expo-router'
import StepsCard from "../components/StepsCard.tsx";

import Report from '../assets/images/report.svg';
import Search from '../assets/images/search.svg';
import Users from '../assets/images/users.svg';
import Chat from '../assets/images/chatdeal.svg';
import Dashboard from '../assets/images/dashboard.svg';

import React, { useState, useRef } from 'react';
import CardItem from '@/components/CardItem';
import { styles } from "../assets/styles/cards.styles";
import { useFonts, Lobster_400Regular } from '@expo-google-fonts/lobster';

export default function Index() {
  const [selectedIds, setSelectedIds] = useState([]);
  console.log(selectedIds);
  
  const [isSelecting, setIsSelecting] = useState(false);

  const [fontsLoaded] = useFonts({
    Lobster_400Regular,
  });

    const cards = [
      { id: 10, name: 'Berlin1', number: 1, place_id: 2 },
      { id: 11, name: 'Berlin2', number: 2, place_id: 2 },
      { id: 12, name: 'Berlin3', number: 3, place_id: 2 },
      { id: 13, name: 'Berlin4', number: 4, place_id: 2 },
      { id: 14, name: 'Berlin5', number: 5, place_id: 2 },
      { id: 15, name: 'Berlin6', number: 6, place_id: 2 },
      { id: 16, name: 'Berlin7', number: 7, place_id: 2 },
      { id: 17, name: 'Berlin8', number: 8, place_id: 2 },
      { id: 18, name: 'Berlin9', number: 9, place_id: 2 }
    ]

    const handleSelect = (id) => {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev : [...prev, id]
      );
      setIsSelecting(true);
    };
  
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 30 }}>My cards</Text>
        <Text style={styles.chapterTitle}>Berlin</Text>
        <FlatList
          horizontal
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.cardsList}
          data={cards}
          renderItem={({ item }) => (
            <CardItem
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onSelect={handleSelect}
            />
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  
/// INDEX DO NOT ERASE !!! ///
    // <View
    //   style={{
    //     flex: 1,
    //     justifyContent: "center",
    //     alignItems: "center",
    //   }}
    // >
    //   <ScrollView
    //     contentContainerStyle={homeStyles.scrollContent}
    //   >
    //     <View style={homeStyles.container}>
    //         <Image
    //           source={require("../assets/images/favImage.png")}
    //           style={{ width: 130, height: 130 }}            
    //         />
    //         <Text style={homeStyles.title}>Welcome to WeSwapCards!</Text>
    //         <Text style={homeStyles.paragraph}>
    //           You use WeWard and want to exchange WeCards easily?
    //         </Text>
    //         <Text style={homeStyles.paragraph}>
    //           This is the place for you!
    //         </Text>
    //         <Text style={homeStyles.paragraph}>
    //           Create an account and start searching for the cards you need!
    //         </Text>
    //         <Text style={homeStyles.disclaimer}>
    //           This platform is <Text style={{ fontWeight: 'bold' }}>not</Text> affiliated in any way with the official WeWard app.
    //         </Text>

    //         <Link href="/sign-up" asChild>
    //           <TouchableOpacity style={styles.button            }>
    //             <Text style={styles.buttonText}>Create an account</           Text>
    //           </TouchableOpacity>
    //         </Link>

    //     </View>
      
    //     <View style={homeStyles.container}>
    //       <StepsCard image={Report} text="Log all the cards you have" />
    //       <StepsCard image={Search} text="Find the card you need" />
    //       <StepsCard image={Users} text="Browse users who have this card" />
    //       <StepsCard image={Chat} text="Chat with them and find a deal" />
    //       <StepsCard image={Dashboard} text="Keep track of your requests in a dashboard" />
    //     </View>

    // </ScrollView>
    // </View>
  // );
}
