import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../assets/styles/dashboard.styles";
import { Colors } from "../constants/Colors";

export const DashboardItem = ({ item, onDelete }) => {
  return (
    <View style={styles.transactionCard} key={item.db_id}>
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
  );
};