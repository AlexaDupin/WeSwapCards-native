import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../assets/styles/dashboard.styles";
import { Colors } from "../constants/Colors";
import { Swipeable } from "react-native-gesture-handler";
import type { DashboardItemData } from '../types/DashboardItemType';

type Props = {
  item: DashboardItemData,
  onDelete: () => void;
}

const DashboardItem = ({ item, onDelete }: Props) => {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const swipeableRef = useRef<Swipeable | null>(null);

  const renderRightActions = useCallback(() => (
      <><TouchableOpacity
          style={styles.renderRightAccept}
          onPress={() => {
              onDelete(); 
              swipeableRef.current?.close();
          }}
      >
          <Ionicons name="checkmark-done-outline" size={24} color="white" />
      </TouchableOpacity>
      
      <TouchableOpacity
          style={styles.renderRightDecline}
          onPress={() => {
            onDelete();
            swipeableRef.current?.close();
          }}
      >
          <Ionicons name="remove-circle-outline" size={24} color="white" />
      </TouchableOpacity></>
  ), [onDelete]);

  const renderLeftActions = useCallback(() => (
      <TouchableOpacity
          style={styles.renderLeftUnread}
          onPress={() => {
              onDelete(); 
              swipeableRef.current?.close();
          }}
      >
          <Ionicons name="mail-unread-outline" size={24} color="white" />
      </TouchableOpacity>
  ), [onDelete]);

  return (
    <Swipeable 
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
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

export default React.memo(DashboardItem);