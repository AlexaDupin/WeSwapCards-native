import { styles } from "@/assets/styles/cards.styles";
import CardItem from '@/components/CardItem';
import PageLoader from "@/components/PageLoader";
import { SignOutButton } from "@/components/SignOutButton";
import { axiosInstance } from '@/helpers/axiosInstance';
import { useAuth } from '@clerk/clerk-expo';
import { Lobster_400Regular, useFonts } from '@expo-google-fonts/lobster';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, Text, View } from 'react-native';
import type { CardItemData, CardStatus } from '../../types/CardItemType';
import type { ChapterData } from '../../types/ChapterType';

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
    statuses: CardStatus[];
  };
  
  type UpsertCardResponse = {
    explorerId: number;
    cardId: number;
    status: "owned" | "duplicated";
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

  const addCardToExplorer = async (cardId: number) => {
    try {
      const token = await getToken();

      const response = await axiosInstance.post<UpsertCardResponse>(`/explorercards/${explorerId}/cards/${cardId}`, {
          duplicate: false
      },
      { headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        console.log(`Card ${cardId} selected. Sending "owned" to backend...`, response);
      }

    } catch (error) {
      console.error("Error adding cart to explorer", error);
    }
  }

  const editDuplicateStatus = async (cardId: number, updatedDuplicateStatus: boolean) => {
    try {
      const token = await getToken();

      const response = await axiosInstance.patch<GetCardStatusesResponse>(`/explorercards/${explorerId}/cards/${cardId}/duplicate`, {
        duplicate: updatedDuplicateStatus,
      },
      { headers: {
        Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        console.log(`Card ${cardId} status updated`);
      }

    } catch (error) {
      console.error("Error fetching statuses", error);
    }
  }

  const handleSelect = async (cardId: number) =>  {
    const currentStatus = cardStatuses[cardId] || 'default';
    const nextStatus = getNextStatus(currentStatus);

    setCardStatuses(prev => ({ ...prev, [cardId]: nextStatus }));

    switch (nextStatus) {
      case 'owned':
        currentStatus === 'default' ? await addCardToExplorer(cardId) : await editDuplicateStatus(cardId, false)
        break;
      case 'duplicated':
        editDuplicateStatus(cardId, true)
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