import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from "../assets/styles/cards.styles";

const STATUS_COLORS = {
  default: '#dedcd7',
  owned: '#7dcfa2',
  duplicated: '#f9a825',
};

const CardItem = ({ item, onSelect, status }) => {

  return (
    <TouchableOpacity onPress={onSelect}>
      <View
          style={[
            styles.cardItem,
            { backgroundColor: STATUS_COLORS[status] || STATUS_COLORS.default },
          ]}
      >
        <Text style={styles.transactionTitle}>{item.number}</Text>
      </View>
    </TouchableOpacity>     
  );
};

export default CardItem;