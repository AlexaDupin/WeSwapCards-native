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

  const getNextStatus = (current) => {
    switch (current) {
      case 'default': return 'owned';
      case 'owned': return 'duplicated';
      case 'duplicated': return 'default';
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
      case 'default':
        console.log(`Card ${id} reset. Sending "reset" to backend...`);
        // await fakeBackendRequest(id, 'reset');
        break;
      }
    };

    // const fakeBackendRequest = async (cardId, status) => {
    //   return new Promise((resolve) => {
    //     setTimeout(() => {
    //       console.log(`Backend received card ${cardId} status: ${status}`);
    //       resolve();
    //     }, 300); // simulate a short delay
    //   });
    // };

  //   const isAlreadySelected = selectedIds.includes(id);
  //   if (isAlreadySelected) {
  //     setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
  //   } else if (!isAlreadySelected) {
  //     setSelectedIds((prev) => [...prev, id]);
  //   }
  // };
     
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
              status={cardStatuses[item.id] || 'default'}
              onSelect={() => handleSelect(item.id)}
            />
          )}
          showsHorizontalScrollIndicator={false}
        />
      </View>
  );
}

export default cards