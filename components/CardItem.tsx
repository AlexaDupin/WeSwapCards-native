import { View, Text, TouchableOpacity } from 'react-native'
import { styles } from "../assets/styles/cards.styles";

const CardItem = ({ item, onSelect, isSelected  }) => {
    return (
      <TouchableOpacity onPress={onSelect}>
          <View
              style={[
                styles.cardItem,
                { backgroundColor: isSelected ? '#7dcfa2' : '#dedcd7' },
              ]}
            >
              <Text style={styles.transactionTitle}>{item.number}</Text>
            </View>
      </TouchableOpacity>      );
};

export default CardItem;