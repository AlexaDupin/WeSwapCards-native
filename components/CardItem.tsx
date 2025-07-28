import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from "../assets/styles/cards.styles";
import { Colors } from "@/constants/Colors";

const CardItem = ({ item, onSelect, status }) => {
  const isOwned = status === 'owned';
  const isDuplicated = status === 'duplicated';

  return (
    <TouchableOpacity onPress={onSelect}>
      <View style={styles.cardItemWrapper}>
        <View
            style={[
              styles.cardItem,
              { backgroundColor: isOwned || isDuplicated ? '#b5e8da' : '#dedcd7' },
              // isOwned || isDuplicated ? styles.cardItemSelected : null,
            ]}
        >
          <Text style={styles.cardNumber}>{item.number}</Text>
          {isDuplicated && <View style={styles.orangeBadge} />}
        </View>
      </View>  
    </TouchableOpacity>     
  );
};

export default CardItem;