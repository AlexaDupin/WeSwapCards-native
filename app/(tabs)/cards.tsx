import React, { useState, useRef } from 'react';
import { View, Text, FlatList } from 'react-native'
import CardItem from '@/components/CardItem';
import { styles } from "@/assets/styles/cards.styles";
import { useFonts, Lobster_400Regular } from '@expo-google-fonts/lobster';

const cards = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  console.log(selectedIds);
  
  const [isSelecting, setIsSelecting] = useState(false);

  const [fontsLoaded] = useFonts({
    Lobster_400Regular,
  });

    const cards = [
      { id: 1, name: 'Berlin1', number: 1, place_id: 2 },
      { id: 2, name: 'Berlin2', number: 2, place_id: 2 },
      { id: 3, name: 'Berlin3', number: 3, place_id: 2 },
      { id: 4, name: 'Berlin4', number: 4, place_id: 2 },
      { id: 5, name: 'Berlin5', number: 5, place_id: 2 },
      { id: 6, name: 'Berlin6', number: 6, place_id: 2 },
      { id: 7, name: 'Berlin7', number: 7, place_id: 2 },
      { id: 8, name: 'Berlin8', number: 8, place_id: 2 },
      { id: 9, name: 'Berlin9', number: 9, place_id: 2 }
    ]

    const handleSelect = (id: string) => {
      const isCardAlreadySelected = selectedIds.some(
        (alreadySelectedCardId: string) => alreadySelectedCardId === id
      );

      if (isCardAlreadySelected) {
          setSelectedIds(selectedIds.filter(
            (alreadySelectedCardId) => alreadySelectedCardId !== id
          ));
      } else {
        setSelectedIds((prev) => [...prev, id]);
      }
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
}

export default cards