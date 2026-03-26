import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@clerk/clerk-expo';

import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import * as swapApi from '@/src/features/swap/api/swapApi';
import * as chatApi from '@/src/features/chat/api/chatApi';

import type {
  SwapCard,
  SwapChapter,
  SwapContactPayload,
  SwapError,
  SwapOpportunityItem,
  SwapPagination,
} from '@/src/features/swap/types/SwapTypes';

export type UseSwapOptions = {
  opportunitiesPageSize?: number;
  onContact?: (payload: SwapContactPayload) => void;
};

type SwapState = {
  chapters: SwapChapter[];
  latestChapters: SwapChapter[];
  cards: SwapCard[];
  selectedChapterId: number | null;
  selectedCardId: number | null;
  opportunities: SwapOpportunityItem[];
  opportunitiesPagination: SwapPagination | null;
  loadingChapters: boolean;
  loadingLatestChapters: boolean;
  loadingCards: boolean;
  loadingOpportunities: boolean;
  loadingMoreOpportunities: boolean;
  error: SwapError | null;
};

const initialState: SwapState = {
  chapters: [],
  latestChapters: [],
  cards: [],
  selectedChapterId: null,
  selectedCardId: null,
  opportunities: [],
  opportunitiesPagination: null,
  loadingChapters: false,
  loadingLatestChapters: false,
  loadingCards: false,
  loadingOpportunities: false,
  loadingMoreOpportunities: false,
  error: null,
};

export function useSwap(options?: UseSwapOptions) {
  const opportunitiesPageSize = options?.opportunitiesPageSize ?? 20;
  const onContact = options?.onContact;

  const { explorerId } = useExplorer();
  const { getToken } = useAuth();

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Mirror existing Clerk/Axios auth-header pattern (see useChatScreen).
  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);
  const latestChaptersReqId = useRef(0);

  const authHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getTokenRef.current();
    if (!token) throw new Error('missing_auth_token');
    return { Authorization: `Bearer ${token}` };
  }, []);

  // Stale-response protection via monotonically increasing request ids.
  const chaptersReqId = useRef(0);
  const cardsReqId = useRef(0);
  /**
   * Opportunities stale model assumes: only one opportunities request is active at a time,
   * including pagination and refresh. New requests invalidate older ones.
   */
  const oppsReqId = useRef(0);
  const contactingRef = useRef(false);

  const [state, setState] = useState<SwapState>(initialState);

  const dismissError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const selectedCardName = useMemo(() => {
    if (state.selectedCardId == null) return null;
    return state.cards.find((c) => c.id === state.selectedCardId)?.name ?? null;
  }, [state.cards, state.selectedCardId]);

  const shouldShowLatestChapters = state.selectedChapterId == null;

  const canLoadMoreOpportunities = useMemo(() => {
    const p = state.opportunitiesPagination;
    if (!p) return false;
    return p.currentPage < p.totalPages;
  }, [state.opportunitiesPagination]);

  const resetForNoChapter = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedChapterId: null,
      cards: [],
      selectedCardId: null,
      opportunities: [],
      opportunitiesPagination: null,
      loadingCards: false,
      loadingOpportunities: false,
      loadingMoreOpportunities: false,
    }));
  }, []);

  // Auth behavior:
  // - opportunities require auth (backend requireAuth())
  // - chapters/cards do not use auth headers here (until confirmed required)
  const loadChapters = useCallback(async () => {
    const reqId = ++chaptersReqId.current;
    setState((prev) => ({ ...prev, loadingChapters: true, error: null }));

    try {
      const chapters = await swapApi.fetchChapters();
      if (!mountedRef.current) return;
      if (chaptersReqId.current !== reqId) return;
      setState((prev) => ({ ...prev, chapters }));
    } catch {
      if (!mountedRef.current) return;
      if (chaptersReqId.current !== reqId) return;
      setState((prev) => ({
        ...prev,
        error: {
          code: 'chapters_fetch_failed',
          message: 'There was an error reaching the server. Try again.',
        },
      }));
    } finally {
      if (!mountedRef.current) return;
      if (chaptersReqId.current !== reqId) return;
      setState((prev) => ({ ...prev, loadingChapters: false }));
    }
  }, []);

  const loadLatestChapters = useCallback(async () => {
    const reqId = ++latestChaptersReqId.current;

    setState((prev) => ({
      ...prev,
      loadingLatestChapters: true,
    }));

    try {
      const latestChapters = await swapApi.fetchLatestChapters({ limit: 8 });

      if (!mountedRef.current) return;
      if (latestChaptersReqId.current !== reqId) return;

      setState((prev) => ({
        ...prev,
        latestChapters,
      }));
    } catch {
      if (!mountedRef.current) return;
      if (latestChaptersReqId.current !== reqId) return;

      setState((prev) => ({
        ...prev,
        error: {
          code: 'chapters_fetch_failed',
          message: 'There was an error reaching the server. Try again.',
        },
      }));
    } finally {
      if (!mountedRef.current) return;
      if (latestChaptersReqId.current !== reqId) return;

      setState((prev) => ({
        ...prev,
        loadingLatestChapters: false,
      }));
    }
  }, []);

  useEffect(() => {
    loadChapters().catch(() => {});
    loadLatestChapters().catch(() => {});
  }, [loadChapters, loadLatestChapters]);

  const selectChapter = useCallback(
    async (chapterId: number | null) => {
      dismissError();

      if (chapterId == null) {
        cardsReqId.current += 1;
        oppsReqId.current += 1;
        resetForNoChapter();
        return;
      }

      const reqId = ++cardsReqId.current;
      oppsReqId.current += 1;

      setState((prev) => ({
        ...prev,
        selectedChapterId: chapterId,
        loadingCards: true,
        cards: [],
        selectedCardId: null,
        opportunities: [],
        opportunitiesPagination: null,
        loadingOpportunities: false,
        loadingMoreOpportunities: false,
      }));

      try {
        const cards = await swapApi.fetchCardsForChapter({ chapterId });
        if (!mountedRef.current) return;
        if (cardsReqId.current !== reqId) return;
        setState((prev) => ({ ...prev, cards }));
      } catch {
        if (!mountedRef.current) return;
        if (cardsReqId.current !== reqId) return;
        setState((prev) => ({
          ...prev,
          error: {
            code: 'cards_fetch_failed',
            message: 'There was an error reaching the server. Try again.',
          },
        }));
      } finally {
        if (!mountedRef.current) return;
        if (cardsReqId.current !== reqId) return;
        setState((prev) => ({ ...prev, loadingCards: false }));
      }
    },
    [dismissError, resetForNoChapter],
  );

  const fetchOpportunitiesPage = useCallback(
    async (args: {
      cardId: number;
      page: number;
      append: boolean;
      mode: 'initial' | 'refresh' | 'more';
    }) => {
      const { cardId, page, append, mode } = args;
      const reqId = ++oppsReqId.current;

      setState((prev) => ({
        ...prev,
        loadingOpportunities: mode !== 'more',
        loadingMoreOpportunities: mode === 'more',
      }));

      if (!explorerId) {
        if (!mountedRef.current) return;
        if (oppsReqId.current !== reqId) return;
        setState((prev) => ({
          ...prev,
          loadingOpportunities: false,
          loadingMoreOpportunities: false,
          error: {
            code: 'sign_in_required',
            message: 'Please sign in to view swap opportunities.',
          },
        }));
        return;
      }

      try {
        const headers = await authHeaders();
        const res = await swapApi.fetchSwapOpportunities({
          explorerId,
          cardId,
          page,
          limit: opportunitiesPageSize,
          headers,
        });

        if (!mountedRef.current) return;
        if (oppsReqId.current !== reqId) return;

        setState((prev) => ({
          ...prev,
          opportunities: append
            ? [...prev.opportunities, ...res.items]
            : res.items,
          opportunitiesPagination: res.pagination,
        }));
      } catch (e) {
        if (!mountedRef.current) return;
        if (oppsReqId.current !== reqId) return;

        const signInRequired =
          e instanceof Error && e.message === 'missing_auth_token';

        setState((prev) => ({
          ...prev,
          error: signInRequired
            ? {
                code: 'sign_in_required',
                message: 'Please sign in to view swap opportunities.',
              }
            : {
                code: 'opportunities_fetch_failed',
                message: 'There was an error reaching the server. Try again.',
              },
        }));
      } finally {
        if (!mountedRef.current) return;
        if (oppsReqId.current !== reqId) return;
        setState((prev) => ({
          ...prev,
          loadingOpportunities: false,
          loadingMoreOpportunities: false,
        }));
      }
    },
    [authHeaders, explorerId, opportunitiesPageSize],
  );

  const selectCard = useCallback(
    async (cardId: number | null) => {
      dismissError();
      oppsReqId.current += 1;

      setState((prev) => ({
        ...prev,
        selectedCardId: cardId,
        opportunities: [],
        opportunitiesPagination: null,
        loadingOpportunities: false,
        loadingMoreOpportunities: false,
      }));

      if (cardId == null) return;

      await fetchOpportunitiesPage({
        cardId,
        page: 1,
        append: false,
        mode: 'initial',
      });
    },
    [dismissError, fetchOpportunitiesPage],
  );

  const loadMoreOpportunities = useCallback(async () => {
    if (state.loadingOpportunities || state.loadingMoreOpportunities) return;
    if (!state.opportunitiesPagination) return;
    if (state.selectedCardId == null) return;

    const p = state.opportunitiesPagination;
    if (p.currentPage >= p.totalPages) return;

    await fetchOpportunitiesPage({
      cardId: state.selectedCardId,
      page: p.currentPage + 1,
      append: true,
      mode: 'more',
    });
  }, [
    fetchOpportunitiesPage,
    state.loadingMoreOpportunities,
    state.loadingOpportunities,
    state.opportunitiesPagination,
    state.selectedCardId,
  ]);

  const refreshOpportunities = useCallback(async () => {
    if (state.selectedCardId == null) return;
    if (state.loadingOpportunities || state.loadingMoreOpportunities) return;

    await fetchOpportunitiesPage({
      cardId: state.selectedCardId,
      page: 1,
      append: false,
      mode: 'refresh',
    });
  }, [
    fetchOpportunitiesPage,
    state.loadingMoreOpportunities,
    state.loadingOpportunities,
    state.selectedCardId,
  ]);

  const contact = useCallback(
    async (opportunity: SwapOpportunityItem): Promise<void> => {
      if (contactingRef.current) return;
      if (!explorerId || !selectedCardName) return;

      contactingRef.current = true;
      try {
        const headers = await authHeaders();

        // Returns the row on 200, null on 204, throws on real errors.
        const existing = await chatApi.getConversation({
          explorerId,
          swapExplorerId: opportunity.explorer_id,
          cardName: selectedCardName,
          headers,
        });

        let conversationId: number;
        if (existing) {
          conversationId = existing.id;
        } else {
          const created = await chatApi.createConversation({
            explorerId,
            swapExplorerId: opportunity.explorer_id,
            cardName: selectedCardName,
            headers,
          });
          conversationId = created.id;
        }

        const payload: SwapContactPayload = {
          explorer_id: opportunity.explorer_id,
          explorer_name: opportunity.explorer_name,
          opportunities: opportunity.opportunities,
          conversationId,
          cardName: selectedCardName,
        };
        onContact?.(payload);
      } catch (err) {
        console.error('[useSwap] contact failed:', err);
        if (!mountedRef.current) return;
        setState((prev) => ({
          ...prev,
          error: {
            code: 'contact_failed',
            message: 'Could not open chat. Please try again.',
          },
        }));
      } finally {
        contactingRef.current = false;
      }
    },
    [authHeaders, explorerId, onContact, selectedCardName],
  );

  const resetSwapView = useCallback(() => {
    cardsReqId.current += 1;
    oppsReqId.current += 1;

    setState((prev) => ({
      ...prev,
      selectedChapterId: null,
      selectedCardId: null,
      cards: [],
      opportunities: [],
      opportunitiesPagination: null,
      loadingCards: false,
      loadingOpportunities: false,
      loadingMoreOpportunities: false,
      error: null,
    }));
  }, []);

  return {
    chapters: state.chapters,
    latestChapters: state.latestChapters,
    cards: state.cards,
    opportunities: state.opportunities,
    opportunitiesPagination: state.opportunitiesPagination,

    selectedChapterId: state.selectedChapterId,
    selectedCardId: state.selectedCardId,
    selectedCardName,

    shouldShowLatestChapters,
    canLoadMoreOpportunities,

    loadingChapters: state.loadingChapters,
    loadingLatestChapters: state.loadingLatestChapters,
    loadingCards: state.loadingCards,
    loadingOpportunities: state.loadingOpportunities,
    loadingMoreOpportunities: state.loadingMoreOpportunities,
    error: state.error,

    loadChapters,
    loadLatestChapters,
    selectChapter,
    selectCard,
    loadMoreOpportunities,
    refreshOpportunities,
    dismissError,
    resetSwapView,

    contact,
  };
}
