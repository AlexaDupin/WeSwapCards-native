import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from "../../../assets/styles/cards.styles";
import type { CardItemData, CardStatus } from '../types/CardItemType';
 
type Props = {
  item: CardItemData,
  status: CardStatus,
  onSelect: () => void,
  reset?: () => void;
}

const CardItem = ({ item, status, onSelect, reset }: Props) => {
  const isOwned = status === 'owned';
  const isDuplicated = status === 'duplicated';
  const cardBackground = (isOwned || isDuplicated) ? '#b5e8da' : '#dedcd7';

  return (
    <TouchableOpacity 
      testID={`card-touch-${item.id}`}
      onPress={onSelect} 
      onLongPress={reset ?? undefined}
      accessibilityRole="button"
      accessibilityLabel={`Card number ${item.number}, status ${status} `}
    >
      <View style={styles.cardItemWrapper}>
        <View
            testID={`card-${item.id}`}
            style={[
              styles.cardItem,
              { backgroundColor: cardBackground },
            ]}
        >
          <Text style={styles.cardNumber}>{item.number}</Text>
          {isDuplicated && <View testID={`badge-${item.id}`} style={styles.orangeBadge} />}
        </View>
      </View>  
    </TouchableOpacity>     
  );
};

export default React.memo(CardItem);