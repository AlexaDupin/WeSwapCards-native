import React, { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChapterSelector from '@/src/features/swap/components/ChapterSelector';
import SectionHeading from '@/src/features/swap/components/SectionHeading';
import CardGrid from '@/src/features/swap/components/CardGrid';
import LatestChaptersBanners from '@/src/features/swap/components/LatestChaptersBanners';
import LatestChaptersMiniTiles from '@/src/features/swap/components/LatestChaptersMiniTiles';
import OpportunityList from '@/src/features/swap/components/OpportunityList';
import TipBubble from '@/src/features/tips/components/TipBubble';
import { useSwap } from '@/src/features/swap/hooks/useSwap';
import type { SwapContactPayload } from '@/src/features/swap/types/SwapTypes';

export default function SwapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isOpeningChat = useRef(false);

  const {
    chapters,
    latestChapters,
    cards,
    selectedChapterId,
    selectedCardId,
    selectedCardName,
    loadingChapters,
    loadingLatestChapters,
    loadingCards,
    loadingOpportunities,
    loadingMoreOpportunities,
    opportunities,
    error,
    selectChapter,
    selectCard,
    loadMoreOpportunities,
    dismissError,
    contact,
    resetSwapView,
  } = useSwap({
    onContact: useCallback(
      (payload: SwapContactPayload) => {
        isOpeningChat.current = true;
        router.push({
          pathname: '/(modal)/chat/[conversationId]',
          params: {
            conversationId:
              payload.conversationId != null
                ? String(payload.conversationId)
                : 'new',
            cardName: payload.cardName,
            swapName: payload.explorer_name,
            swapExplorerId: String(payload.explorer_id),
            offeredCards: JSON.stringify(
              payload.opportunities.map((o) => ({
                id: o.card.id,
                name: o.card.name,
              })),
            ),
          },
        });
      },
      [router],
    ),
  });

  useFocusEffect(
    React.useCallback(() => {
      isOpeningChat.current = false;
      return () => {
        if (!isOpeningChat.current) {
          resetSwapView();
        }
      };
    }, [resetSwapView]),
  );

  const selectedChapterName = useMemo(() => {
    if (selectedChapterId == null) return null;
    return chapters.find((c) => c.id === selectedChapterId)?.name ?? null;
  }, [chapters, selectedChapterId]);

  const headerContent = (
    <>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Find a card</Text>
      </View>

      {error ? (
        <Text style={styles.errorText} onPress={dismissError}>
          {error.message}
        </Text>
      ) : null}

      {selectedChapterId != null ? (
        <LatestChaptersMiniTiles
          chapters={latestChapters}
          loading={loadingLatestChapters}
          selectedChapterId={selectedChapterId}
          onSelectChapter={selectChapter}
        />
      ) : null}

      <ChapterSelector
        chapters={chapters}
        selectedChapterId={selectedChapterId}
        selectedChapterName={selectedChapterName}
        loading={loadingChapters}
        onSelectChapter={selectChapter}
      />

      {selectedChapterId == null ? (
        <>
          <SectionHeading kicker="Latest chapters" />
          <LatestChaptersBanners
            chapters={latestChapters}
            loading={loadingLatestChapters}
            onSelectChapter={selectChapter}
          />
        </>
      ) : null}
    </>
  );

  return (
    <View style={styles.screen}>
      {selectedChapterId == null ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: 16 + insets.top },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {headerContent}
        </ScrollView>
      ) : loadingCards ? (
        <View style={[styles.scrollContent, { paddingTop: 16 + insets.top }]}>
          {headerContent}
          <View style={styles.loaderWrap}>
            <ActivityIndicator />
          </View>
        </View>
      ) : (
        <View style={styles.chapterMode}>
          <View style={[styles.headerWrap, { paddingTop: 16 + insets.top }]}>
            {headerContent}
          </View>

          <OpportunityList
            selectedCardId={selectedCardId}
            selectedCardName={selectedCardName}
            opportunities={opportunities}
            loadingOpportunities={loadingOpportunities}
            loadingMoreOpportunities={loadingMoreOpportunities}
            onLoadMore={loadMoreOpportunities}
            onContact={contact}
            topContent={
              <CardGrid
                cards={cards}
                selectedCardId={selectedCardId}
                onSelectCard={selectCard}
                variant="static"
              />
            }
          />
        </View>
      )}

      <TipBubble tipKey="swap" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  chapterMode: {
    flex: 1,
  },
  headerWrap: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  // The Dashboard and My cards titles share a row with a 34px control (the
  // avatar, the help button), which centres their text a few px down. Swap has
  // no such control, so the row reserves that height on its own and all three
  // titles start at the same place.
  titleRow: {
    minHeight: 34,
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  errorText: {
    color: '#b00020',
    marginBottom: 12,
  },
  loaderWrap: {
    paddingVertical: 16,
  },
});
