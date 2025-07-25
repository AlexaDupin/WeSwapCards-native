import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../assets/styles/cards.styles";
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  runOnJS,
} from 'react-native-reanimated';

const CardItem = ({ item, onSelect, isSelected }) => {
  const onGestureEvent = useAnimatedGestureHandler({
      onStart: (_, ctx) => {
        runOnJS(onSelect)(item.id);
      },
      onActive: (_, ctx) => {
        runOnJS(onSelect)(item.id);
      }
    });

    return (
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
        >
          <Animated.View>
            <View
              style={[
                styles.cardItem,
                { backgroundColor: isSelected ? '#7dcfa2' : '#dedcd7' },
              ]}
            >
              <Text style={styles.transactionTitle}>{item.number}</Text>
            </View>
          </Animated.View>
        </PanGestureHandler>
      );
};

export default CardItem;