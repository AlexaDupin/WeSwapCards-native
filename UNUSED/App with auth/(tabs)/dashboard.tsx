import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native'
import { SignOutButton } from '@/src/components/SignOutButton'
import PageLoader from '../../../src/components/PageLoader'
import { DashboardItem } from '../../../src/features/dashboard/components/DashboardItem'
import NoConvFound from '../../../src/components/NoConvFound'
import { styles } from "../../../src/assets/styles/dashboard.styles";

const Dashboard = () => {
  // const [isLoading, setIsLoading] = useState();

  const conversations = [
    {
      row_id: '1',
      db_id: 2,
      card_name: 'Afrique du Sud1',
      swap_explorer: 'wewardcardexchange',
      swap_explorer_id: 10,
      status: 'In progress',
      creator_id: 10,
      recipient_id: 1,
      unread: '0'
    },
    {
      row_id: '2',
      db_id: 71,
      card_name: 'Barcelone4',
      swap_explorer: 'Comline',
      swap_explorer_id: 10,
      status: 'In progress',
      creator_id: 10,
      recipient_id: 1,
      unread: '0'
    }
  ]

  const handleDelete = (id) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => console.log(id) },
    ]);
  };

  // if (isLoading) return <PageLoader />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 30 }}>Dashboard</Text>
      
      <View style={styles.pillList}>
        <TouchableOpacity
              style={styles.pill}
        >
          <Text style={styles.pillText}>In progress</Text>
        </TouchableOpacity>
        <TouchableOpacity
              style={styles.pill}
        >
          <Text style={styles.pillText}>Past</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={conversations}
        renderItem={({ item }) => <DashboardItem item={item} onDelete={handleDelete} />}
        ListEmptyComponent={<NoConvFound />}
        showsVerticalScrollIndicator={false}
        // refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
      <SignOutButton />
    </View>
  );
};

export default Dashboard;
