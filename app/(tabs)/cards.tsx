import { styles } from "@/src/assets/styles/cards.styles";
import CardItem from '@/src/features/cards/components/CardItem';
import PageLoader from "@/src/components/PageLoader";
import { SignOutButton } from "@/src/components/SignOutButton";
import { axiosInstance } from '@/src/lib/axiosInstance';
import { useAuth } from '@clerk/clerk-expo';
import { Lobster_400Regular, useFonts } from '@expo-google-fonts/lobster';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import type { CardItemData, CardStatus } from '../../src/features/cards/types/CardItemType';
import type { ChapterData } from '../../src/features/chapters/types/ChapterType';

const Cards = () => {
  const [cardStatuses, setCardStatuses] = useState<Record<number, CardStatus>>({});
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [cards, setCards] = useState<CardItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const explorerId: number = 134;

  type GetChaptersResponse = {
    places: ChapterData[];
  };
  
  type GetCardsResponse = {
    cards: CardItemData[];
  };

  type GetCardStatusesResponse = {
    statuses: Record<number, CardStatus>;
  };
  
  type UpsertCardResponse = {
    explorerId: number;
    cardId: number;
    duplicate: boolean;
    changed: boolean;
  };
  
  const { getToken } = useAuth();

  const fetchAllChapters = async () => {
    try {
      const response = await axiosInstance.get<GetChaptersResponse>('/places');
      setChapters(response.data.places);
    } catch (error) {
      console.error("Error fetching chapters", error);
    }
  };
  
  const fetchAllCards = async () => {
    try {
      const token = await getToken();
      const response = await axiosInstance.get<GetCardsResponse>('/cards', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCards(response.data.cards);
    } catch (error) {
      console.error("Error fetching cards", error);
    }
  };

  const fetchAllCardStatuses = async (explorerId: number) => {
    // console.log('explorerId', explorerId);
    
    try {
      const token = await getToken();
      const response = await axiosInstance.get<GetCardStatusesResponse>(`/cards/statuses/${explorerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log('statuses', response.data.statuses);
      setCardStatuses(response.data.statuses);
    } catch (error) {
      console.error("Error fetching statuses", error);
    }
  }
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchAllChapters(), fetchAllCards(), fetchAllCardStatuses(explorerId)]);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, []);

  useFonts({
    Lobster_400Regular,
  });
  
  const getNextStatus = (current: CardStatus) => {
    switch (current) {
      case 'default': return 'owned';
      case 'owned': return 'duplicated';
      case 'duplicated': return 'owned';
      default: return 'owned';
    }
  };

  const upsertCard = async (cardId: number, duplicate: boolean) => {
    const token = await getToken();
    const response = await axiosInstance.put<UpsertCardResponse>(`/explorercards/${explorerId}/cards/${cardId}`,
      { duplicate },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`Card ${cardId} status updated`, response.data);

    if (response.status === 200 && response.data.duplicate === false) { 
      setCardStatuses(prev => ({ ...prev, [cardId]: 'owned' }));
    } 

    if (response.status === 200 && response.data.duplicate === true) { 
      setCardStatuses(prev => ({ ...prev, [cardId]: 'duplicated' }));
    } 
  };

  const handleSelect = async (cardId: number) =>  {
    const currentStatus = cardStatuses[cardId] || 'default';
    const nextStatus = getNextStatus(currentStatus);

    switch (nextStatus) {
      case 'owned':
        await upsertCard(cardId, false)
        break;
      case 'duplicated':
        await upsertCard(cardId, true)
        break;
    }
  };

  const reset = async (cardId: number) => {  
    try {
      const token = await getToken();

      const response = await axiosInstance.delete(`/explorercards/${explorerId}/cards/${cardId}`,
      { headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setCardStatuses(prev => ({ ...prev, [cardId]: 'default' }));
        console.log(`Card ${cardId} has been deleted`);
      }

    } catch (error) {
      console.error("Error during card deletion", error);
    }
  };

  if (isLoading) {
    return <PageLoader />
  }
     
   return (
  <View style={{ flex: 1, padding: 16 }}>
    <SignOutButton />
    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 30 }}>My cards</Text>

    <ScrollView showsVerticalScrollIndicator={false}>
    {chapters.map((chapter) => {
      const chapterCards = cards.filter(card => card.place_id === chapter.id);

      return (
        <View key={chapter.id} style={{ marginBottom: 30 }}>
          <Text style={styles.chapterTitle}>{chapter.name}</Text>

          <FlatList<CardItemData>
            horizontal
            keyExtractor={(item: CardItemData) => item.id.toString()}
            contentContainerStyle={styles.cardsList}
            data={chapterCards}
            renderItem={({ item }: { item: CardItemData }) => (
              <CardItem
                item={item}
                status={cardStatuses[item.id] || 'default'}
                onSelect={() => handleSelect(item.id)}
                reset={() => reset(item.id)}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      );
    })}
    </ScrollView>
  </View>
);
}

export default Cards