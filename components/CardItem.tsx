import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from "../assets/styles/cards.styles";
import type { CardItemData } from '../types/cardItemType';
 
type Props = {
  item: CardItemData,
  status: 'default' | 'owned' | 'duplicated',
  onSelect: () => void,
  reset?: () => void;
}

const CardItem = ({ item, status, onSelect, reset }: Props) => {
  const isOwned = status === 'owned';
  const isDuplicated = status === 'duplicated';
  const cardBackground = (isOwned || isDuplicated) ? '#b5e8da' : '#dedcd7';

  return (
    <TouchableOpacity onPress={onSelect} onLongPress={reset ?? undefined}>
      <View style={styles.cardItemWrapper}>
        <View
            style={[
              styles.cardItem,
              { backgroundColor: cardBackground },
            ]}
        >
          <Text style={styles.cardNumber}>{item.number}</Text>
          {isDuplicated && <View style={styles.orangeBadge} />}
        </View>
      </View>  
    </TouchableOpacity>     
  );
};

export default React.memo(CardItem);