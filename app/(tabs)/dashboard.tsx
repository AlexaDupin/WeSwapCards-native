import React, { useMemo, useCallback } from 'react'
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native'
import PageLoader from '@/components/PageLoader'
import DashboardItem from '@/components/DashboardItem'
import Pill from '@/components/Pill'
import NoConvFound from '@/components/NoConvFound'
import { styles } from "@/assets/styles/dashboard.styles";
import { DashboardItemData } from '@/types/DashboardItemType'

const mockConversations: DashboardItemData[] = [
  {
    row_id: '1',
    db_id: 2,
    card_name: 'Afrique du Sud1',
    swap_explorer: 'wewardcardexchange',
    swap_explorer_id: 10,
    status: 'In progress',
    creator_id: 10,
    recipient_id: 1,
    unread: '0',
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
    unread: '0',
  },
];

const Dashboard = () => {
  // const [isLoading, setIsLoading] = useState();
  const conversations = useMemo(() => mockConversations, []);

  const handleDelete = useCallback((id: number) => {
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => console.log(id) },
    ]);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: DashboardItemData }) => (
      <DashboardItem item={item} onDelete={() => handleDelete(item.db_id)} />
    ),
    [handleDelete]
  );
  // if (isLoading) return <PageLoader />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 30 }}>Dashboard</Text>
      
      <View style={styles.pillList}>
        <Pill text="In progress"/>
        <Pill text="Past"/>
      </View>

      <FlatList
        style={styles.transactionsList}
        contentContainerStyle={styles.transactionsListContent}
        data={conversations}
        renderItem={renderItem}
        ListEmptyComponent={<NoConvFound />}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item: DashboardItemData) => item.db_id.toString()}
      />
    </View>
  );
};

export default Dashboard;
