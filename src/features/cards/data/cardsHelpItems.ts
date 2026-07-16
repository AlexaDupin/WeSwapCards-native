import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

import type { CardStatus } from '@/src/features/cards/types/CardItemType';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export type CardsHelpItem = {
  gesture: IoniconName;
  modifierIcon?: IoniconName | undefined;
  modifierText?: string | undefined;
  status: CardStatus;
  title: string;
  text: string;
};

export const CARDS_HELP_TITLE = 'How to log your cards';

// The preview tiles render the real card statuses, so this list mirrors the
// cycle in useCardsScreen's getNextStatus: tap walks default → owned →
// duplicated → owned, and a long press resets to default.
export const cardsHelpItems: readonly CardsHelpItem[] = [
  {
    gesture: 'hand-left-outline',
    status: 'owned',
    title: 'Tap once',
    text: 'You have this card',
  },
  {
    gesture: 'hand-left-outline',
    modifierText: '×2',
    status: 'duplicated',
    title: 'Tap again',
    text: 'You have this card duplicated. If you don’t have extras anymore, tap again to switch.',
  },
  {
    gesture: 'hand-left-outline',
    modifierIcon: 'time-outline',
    status: 'default',
    title: 'Press & hold',
    text: 'You don’t have this card',
  },
] as const;
