import type Ionicons from '@expo/vector-icons/Ionicons';

// In-app coaching shown once per explorer, one tip per tab. This is a separate
// layer from the onboarding carousel: the carousel runs pre-signup to build
// familiarity and drive sign-up, these run post-signin to teach the app.
//
// The tips are independent — each fires on the first visit to its own tab, in
// whatever order the user wanders — so each one has to stand on its own without
// assuming the others have been read.
export type TipKey = 'cards' | 'swap' | 'dashboard';

export type Tip = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
};

export const tips: Record<TipKey, Tip> = {
  cards: {
    icon: 'duplicate-outline',
    title: 'First, add your cards',
    body: 'For each chapter, you can mark all cards at once as owned or duplicated. This step helps you find people who need your duplicate cards.',
  },
  swap: {
    icon: 'search-outline',
    title: 'Find your missing cards',
    body: 'Tap a chapter, then select a card to see who has it and who needs your duplicates. Send them a message to start a swap.',
  },
  dashboard: {
    icon: 'chatbubbles-outline',
    title: 'Manage your swap requests',
    body: 'Find all your conversations here. Come back to this tab to see new messages and change conversations’ status.',
  },
};
