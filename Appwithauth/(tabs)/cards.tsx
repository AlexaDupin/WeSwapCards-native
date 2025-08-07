import { View, Text, FlatList } from 'react-native'
import React from 'react'
import CardItem from '@/components/CardItem';
import { styles } from "../../assets/styles/cards.styles";

const cards = () => {
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

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 30 }}>My cards</Text>

      <FlatList
        // style={styles.cardsList}
        contentContainerStyle={styles.cardsList}
        data={cards}
        renderItem={({ item }) => <CardItem item={item} />}
        // ListEmptyComponent={<NoConvFound />}
        showsVerticalScrollIndicator={false}
        // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

export default cards