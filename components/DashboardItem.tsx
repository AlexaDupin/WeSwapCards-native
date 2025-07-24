import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../assets/styles/dashboard.styles";
import { Colors } from "../constants/Colors";
import { Swipeable } from "react-native-gesture-handler";

export const DashboardItem = ({ item, onDelete }) => {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const swipeableRef = useRef(null);

  const renderRightActions = () => (
      <><TouchableOpacity
          style={{
              backgroundColor: Colors.secondary,
              justifyContent: "center",
              alignItems: "center",
              width: 70,
              marginBottom: 10,
              alignSelf: 'stretch',
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
          }}
          onPress={() => {
              onDelete(item.db_id); 
              swipeableRef.current?.close();
          }}
      >
          <Ionicons name="checkmark-done-outline" size={24} color="white" />
      </TouchableOpacity>
      
      <TouchableOpacity
          style={{
              backgroundColor: Colors.primary,
              justifyContent: "center",
              alignItems: "center",
              width: 70,
              marginBottom: 10,
              alignSelf: 'stretch',
            //   borderTopRightRadius: 12,
            //   borderBottomRightRadius: 12,
          }}
          onPress={() => {
            onDelete(item.db_id);
            swipeableRef.current?.close();
          }}
      >
              <Ionicons name="remove-circle-outline" size={24} color="white" />
          </TouchableOpacity></>
    );

  return (
    <Swipeable 
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => setIsSwipeOpen(true)}
        onSwipeableClose={() => setIsSwipeOpen(false)}
    >
    <View 
      style={[
        styles.transactionCard,
        {
          borderTopRightRadius: isSwipeOpen ? 0 : 12,
          borderBottomRightRadius: isSwipeOpen ? 0 : 12,
        }
      ]} 
      key={item.db_id}
    >      
    
    <TouchableOpacity style={styles.transactionContent}>
        <View style={styles.categoryIconContainer}>
          <Ionicons name={"checkmark-done-outline"} size={22} color={Colors.primary} />
        </View>
        <View style={styles.transactionLeft}>
          <Text style={styles.transactionTitle}>{item.card_name}</Text>
          <Text style={styles.transactionCategory}>{item.swap_explorer}</Text>
        </View>
        <View style={styles.transactionRight}>
          <Text style={styles.transactionCategory}></Text>
          <Text style={styles.transactionDate}>3 hours ago</Text>
        </View>
      </TouchableOpacity>
    </View>
    </Swipeable>
  );
};