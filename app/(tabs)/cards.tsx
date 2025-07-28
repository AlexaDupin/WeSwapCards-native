import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native'
import CardItem from '@/components/CardItem';
import { styles } from "@/assets/styles/cards.styles";
import { useFonts, Lobster_400Regular } from '@expo-google-fonts/lobster';

const cards = () => {
  const [cardStatuses, setCardStatuses] = useState({});

  const [fontsLoaded] = useFonts({
    Lobster_400Regular,
  });

  const chapters = [
    {id: 1, name: 'Brussels', place_id: 1},
    {id: 2, name: 'Berlin', place_id: 2},
  ]
  const cards = [
    { id: 1, name: 'Brussels1', number: 1, place_id: 1 },
    { id: 2, name: 'Brussels2', number: 2, place_id: 1 },
    { id: 3, name: 'Brussels3', number: 3, place_id: 1 },
    { id: 4, name: 'Brussels4', number: 4, place_id: 1 },
    { id: 5, name: 'Brussels5', number: 5, place_id: 1 },
    { id: 6, name: 'Brussels6', number: 6, place_id: 1 },
    { id: 7, name: 'Brussels7', number: 7, place_id: 1 },
    { id: 8, name: 'Brussels8', number: 8, place_id: 1 },
    { id: 9, name: 'Brussels9', number: 9, place_id: 1 },
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

  const getNextStatus = (current) => {
    switch (current) {
      case 'default': return 'owned';
      case 'owned': return 'duplicated';
      case 'duplicated': return 'owned';
      default: return 'owned';
    }
  };

  const handleSelect = (id: string) => {
    const currentStatus = cardStatuses[id] || 'default';
    const nextStatus = getNextStatus(currentStatus);

    setCardStatuses(prev => ({ ...prev, [id]: nextStatus }));

    switch (nextStatus) {
      case 'owned':
        console.log(`Card ${id} selected. Sending "owned" to backend...`);
        // await fakeBackendRequest(id, 'owned');
        break;
      case 'duplicated':
        console.log(`Card ${id} duplicated. Sending "duplicated" to backend...`);
        // await fakeBackendRequest(id, 'duplicated');
        break;
      // case 'default':
      //   console.log(`Card ${id} reset. Sending "reset" to backend...`);
      //   // await fakeBackendRequest(id, 'reset');
      //   break;
      }
    };

    const reset = (id: string) => {  
      setCardStatuses(prev => ({ ...prev, [id]: 'default' }));
      console.log(`Card ${id} reset. Sending "reset" to backend...`);
    };
    // const fakeBackendRequest = async (cardId, status) => {
    //   return new Promise((resolve) => {
    //     setTimeout(() => {
    //       console.log(`Backend received card ${cardId} status: ${status}`);
    //       resolve();
    //     }, 300); // simulate a short delay
    //   });
    // };
     
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 30 }}>My cards</Text>

        {chapters.map((chapter) => {
      const chapterCards = cards.filter(card => card.place_id === chapter.place_id);

      return (
        <View key={chapter.id} style={{ marginBottom: 30 }}>
          <Text style={styles.chapterTitle}>{chapter.name}</Text>

          <FlatList
            horizontal
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.cardsList}
            data={chapterCards}
            renderItem={({ item }) => (
              <CardItem
                item={item}
                status={cardStatuses[item.id] || 'default'}
                onSelect={() => handleSelect(item.id)}
                reset={() => reset(item.id)}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      );
    })}
  </View>
);

        {/* <View>

        <FlatList
          horizontal
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.cardsList}
          data={chapters}
          renderItem={({ item }) => (
            <Text style={styles.chapterTitle}>{item.name}</Text>
          )}
          showsHorizontalScrollIndicator={false}
        />

        <FlatList
          horizontal
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.cardsList}
          data={cards}
          renderItem={({ item }) => (
            <CardItem
              item={item}
              status={cardStatuses[item.id] || 'default'}
              onSelect={() => handleSelect(item.id)}
            />
          )}
          showsHorizontalScrollIndicator={false}
        />
        </View>
      </View>
  ); */}
}

export default cards