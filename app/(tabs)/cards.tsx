
// src/features/cards/screens/Cards.tsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { Text, View } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

import PageLoader from "@/src/components/PageLoader";
import { SignOutButton } from "@/src/components/SignOutButton";
import { axiosInstance } from "@/src/lib/axiosInstance";

import type { CardItemData, CardStatus } from "@/src/features/cards/types/CardItemType";
import type { ChapterData } from "@/src/features/chapters/types/ChapterType";

import ChaptersList from "@/src/features/chapters/components/ChaptersList";
import { styles } from "@/src/assets/styles/cards.styles";

type GetChaptersResponse = { places: ChapterData[] };
type GetCardsResponse = { cards: CardItemData[] };
type GetCardStatusesResponse = { statuses: Record<string, CardStatus> };
type UpsertCardResponse = { explorerId: number; cardId: number; duplicate: boolean; changed: boolean };

export type ChapterUI = {
  chapterId: number;
  chapterName: string;
  cards: CardItemData[];
  ownedOrDuplicatedCount: number;
};

export default function Cards() {
  const [cardStatuses, setCardStatuses] = useState<Record<string, CardStatus>>({});
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [cards, setCards] = useState<CardItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // TODO: replace with your real explorer id source
  const explorerId: number = 134;

  const { getToken } = useAuth();

  const fetchAllChapters = useCallback(async () => {
    const response = await axiosInstance.get<GetChaptersResponse>("/places");
    setChapters(response.data.places);
  }, []);

  const fetchAllCards = useCallback(async () => {
    const token = await getToken();
    const response = await axiosInstance.get<GetCardsResponse>("/cards", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCards(response.data.cards);
  }, [getToken]);

  const fetchAllCardStatuses = useCallback(
    async (id: number) => {
      try {
        const token = await getToken();
        const response = await axiosInstance.get<GetCardStatusesResponse>(`/cards/statuses/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const statuses = response.data?.statuses;
        setCardStatuses(statuses && typeof statuses === "object" ? statuses : {});
      } catch (e) {
        console.error("Error fetching statuses", e);
      }
    },
    [getToken]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await Promise.all([fetchAllChapters(), fetchAllCards(), fetchAllCardStatuses(explorerId)]);
      } catch (e) {
        console.error("Cards screen load failed", e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [explorerId, fetchAllChapters, fetchAllCards, fetchAllCardStatuses]);

  const cardsByPlaceId = useMemo(() => {
    const map: Record<number, CardItemData[]> = {};
    for (const c of cards) {
      (map[c.place_id] ??= []).push(c);
    }
    return map;
  }, [cards]);

  const chaptersData: ChapterUI[] = useMemo(() => {
    return chapters.map((ch) => {
      const chapterCards = cardsByPlaceId[ch.id] ?? [];
      const ownedOrDuplicatedCount = chapterCards.reduce((acc, card) => {
        const s = cardStatuses[String(card.id)] ?? "default";
        return s === "owned" || s === "duplicated" ? acc + 1 : acc;
      }, 0);

      return {
        chapterId: ch.id,
        chapterName: ch.name,
        cards: chapterCards,
        ownedOrDuplicatedCount,
      };
    });
  }, [chapters, cardsByPlaceId, cardStatuses]);

  const getNextStatus = (current: CardStatus): CardStatus => {
    switch (current) {
      case "default":
        return "owned";
      case "owned":
        return "duplicated";
      case "duplicated":
        return "owned";
      default:
        return "owned";
    }
  };

  const upsertCard = useCallback(
    async (cardId: number, duplicate: boolean) => {
      const token = await getToken();

      const response = await axiosInstance.put<UpsertCardResponse>(
        `/explorercards/${explorerId}/cards/${cardId}`,
        { duplicate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setCardStatuses((prev) => ({
          ...prev,
          [String(cardId)]: response.data.duplicate ? "duplicated" : "owned",
        }));
      }
    },
    [explorerId, getToken]
  );

  const handleSelect = useCallback(
    async (cardId: number) => {
      const currentStatus = cardStatuses[String(cardId)] || "default";
      const nextStatus = getNextStatus(currentStatus);

      if (nextStatus === "owned") return upsertCard(cardId, false);
      if (nextStatus === "duplicated") return upsertCard(cardId, true);
    },
    [cardStatuses, upsertCard]
  );

  const reset = useCallback(async (cardId: number) => {
    const current = cardStatuses[cardId] || 'default';
    if (current === 'default') return;

      try {
        const token = await getToken();
        const response = await axiosInstance.delete(`/explorercards/${explorerId}/cards/${cardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setCardStatuses((prev) => ({ ...prev, [String(cardId)]: "default" }));
        } else {
          console.warn("Unexpected reset status:", response.status);
        }
      } catch (error) {
        console.error("Error during card deletion", error);
      }
    },
    [explorerId, getToken]
  );

  // Optional bulk actions (wire to your endpoints if you have them)
  const markAllOwnedInChapter = useCallback(
    async (chapterId: number) => {
      const chapterCards = cardsByPlaceId[chapterId] ?? [];
      setCardStatuses((prev) => {
        const next = { ...prev };
        for (const c of chapterCards) next[String(c.id)] = "owned";
        return next;
      });
      // TODO: call your backend bulk endpoint if/when you add it
    },
    [cardsByPlaceId]
  );

  const markAllDuplicatedInChapter = useCallback(
    async (chapterId: number) => {
      const chapterCards = cardsByPlaceId[chapterId] ?? [];
      setCardStatuses((prev) => {
        const next = { ...prev };
        for (const c of chapterCards) next[String(c.id)] = "duplicated";
        return next;
      });
      // TODO: call your backend bulk endpoint if/when you add it
    },
    [cardsByPlaceId]
  );

  const isChapterPending = useCallback((_chapterId: number) => false, []);

  if (isLoading) return <PageLoader />;

  return (
    <View style={styles.cardsScreen}>
      <SignOutButton />
      <Text style={styles.pageTitle}>My cards</Text>

      <ChaptersList
        chaptersData={chaptersData}
        statuses={cardStatuses}
        onSelectCard={handleSelect}
        onResetCard={reset}
        onMarkAllOwned={markAllOwnedInChapter}
        onMarkAllDuplicated={markAllDuplicatedInChapter}
        isChapterPending={isChapterPending}
        readOnly={false}
      />
    </View>
  );
}



// import { styles } from "@/src/assets/styles/cards.styles";
// import CardItem from '@/src/features/cards/components/CardItem';
// import PageLoader from "@/src/components/PageLoader";
// import { SignOutButton } from "@/src/components/SignOutButton";
// import { axiosInstance } from '@/src/lib/axiosInstance';
// import { useAuth } from '@clerk/clerk-expo';
// import { Lobster_400Regular, useFonts } from '@expo-google-fonts/lobster';
// import { useEffect, useState } from 'react';
// import { FlatList, ScrollView, Text, View } from 'react-native';
// import type { CardItemData, CardStatus } from '../../src/features/cards/types/CardItemType';
// import type { ChapterData } from '../../src/features/chapters/types/ChapterType';

// const Cards = () => {
//   const [cardStatuses, setCardStatuses] = useState<Record<number, CardStatus>>({});
//   const [chapters, setChapters] = useState<ChapterData[]>([]);
//   const [cards, setCards] = useState<CardItemData[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const explorerId: number = 134;

//   type GetChaptersResponse = {
//     places: ChapterData[];
//   };
  
//   type GetCardsResponse = {
//     cards: CardItemData[];
//   };

//   type GetCardStatusesResponse = {
//     statuses: Record<number, CardStatus>;
//   };
  
//   type UpsertCardResponse = {
//     explorerId: number;
//     cardId: number;
//     duplicate: boolean;
//     changed: boolean;
//   };
  
//   const { getToken } = useAuth();

//   const fetchAllChapters = async () => {
//     try {
//       const response = await axiosInstance.get<GetChaptersResponse>('/places');
//       setChapters(response.data.places);
//     } catch (error) {
//       console.error("Error fetching chapters", error);
//     }
//   };
  
//   const fetchAllCards = async () => {
//     try {
//       const token = await getToken();
//       const response = await axiosInstance.get<GetCardsResponse>('/cards', {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setCards(response.data.cards);
//     } catch (error) {
//       console.error("Error fetching cards", error);
//     }
//   };

//   const fetchAllCardStatuses = async (explorerId: number) => {
//     // console.log('explorerId', explorerId);
    
//     try {
//       const token = await getToken();
//       const response = await axiosInstance.get<GetCardStatusesResponse>(`/cards/statuses/${explorerId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       // console.log('statuses', response.data.statuses);
//       setCardStatuses(response.data.statuses);
//     } catch (error) {
//       console.error("Error fetching statuses", error);
//     }
//   }
  
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         await Promise.all([fetchAllChapters(), fetchAllCards(), fetchAllCardStatuses(explorerId)]);
//       } finally {
//         setIsLoading(false);
//       }
//     };
  
//     fetchData();
//   }, []);

//   useFonts({
//     Lobster_400Regular,
//   });
  
//   const getNextStatus = (current: CardStatus) => {
//     switch (current) {
//       case 'default': return 'owned';
//       case 'owned': return 'duplicated';
//       case 'duplicated': return 'owned';
//       default: return 'owned';
//     }
//   };

//   const upsertCard = async (cardId: number, duplicate: boolean) => {
//     const token = await getToken();
//     const response = await axiosInstance.put<UpsertCardResponse>(`/explorercards/${explorerId}/cards/${cardId}`,
//       { duplicate },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     console.log(`Card ${cardId} status updated`, response.data);

//     if (response.status === 200 && response.data.duplicate === false) { 
//       setCardStatuses(prev => ({ ...prev, [cardId]: 'owned' }));
//     } 

//     if (response.status === 200 && response.data.duplicate === true) { 
//       setCardStatuses(prev => ({ ...prev, [cardId]: 'duplicated' }));
//     } 
//   };

//   const handleSelect = async (cardId: number) =>  {
//     const currentStatus = cardStatuses[cardId] || 'default';
//     const nextStatus = getNextStatus(currentStatus);

//     switch (nextStatus) {
//       case 'owned':
//         await upsertCard(cardId, false)
//         break;
//       case 'duplicated':
//         await upsertCard(cardId, true)
//         break;
//     }
//   };

//   const reset = async (cardId: number) => {  
//     try {
//       const token = await getToken();

//       const response = await axiosInstance.delete(`/explorercards/${explorerId}/cards/${cardId}`,
//       { headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.status === 200) {
//         setCardStatuses(prev => ({ ...prev, [cardId]: 'default' }));
//         console.log(`Card ${cardId} has been deleted`);
//       }

//     } catch (error) {
//       console.error("Error during card deletion", error);
//     }
//   };

//   if (isLoading) {
//     return <PageLoader />
//   }
     
//    return (
//   <View style={{ flex: 1, padding: 16 }}>
//     <SignOutButton />
//     <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 30 }}>My cards</Text>

//     <ScrollView showsVerticalScrollIndicator={false}>
//     {chapters.map((chapter) => {
//       const chapterCards = cards.filter(card => card.place_id === chapter.id);

//       return (
//         <View key={chapter.id} style={{ marginBottom: 30 }}>
//           <Text style={styles.chapterTitle}>{chapter.name}</Text>

//           <FlatList<CardItemData>
//             horizontal
//             keyExtractor={(item: CardItemData) => item.id.toString()}
//             contentContainerStyle={styles.cardsList}
//             data={chapterCards}
//             renderItem={({ item }: { item: CardItemData }) => (
//               <CardItem
//                 item={item}
//                 status={cardStatuses[item.id] || 'default'}
//                 onSelect={() => handleSelect(item.id)}
//                 reset={() => reset(item.id)}
//               />
//             )}
//             showsHorizontalScrollIndicator={false}
//           />
//         </View>
//       );
//     })}
//     </ScrollView>
//   </View>
// );
// }

// export default Cards