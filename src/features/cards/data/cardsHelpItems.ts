import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';
import type MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { CardStatus } from '@/src/features/cards/types/CardItemType';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
// Ionicons only ships open hands, so the tapping finger comes from
// MaterialIcons instead. That set has no hold variant, hence the clock
// modifier on the press & hold row below.
type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export type CardsHelpItem = {
  gesture: MaterialIconName;
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
    gesture: 'touch-app',
    status: 'owned',
    title: 'Tap once',
    text: 'You have this card',
  },
  {
    gesture: 'touch-app',
    modifierText: '×2',
    status: 'duplicated',
    title: 'Tap again',
    text: 'You have this card duplicated. If you don’t have extras anymore, tap again to switch.',
  },
  {
    gesture: 'touch-app',
    modifierIcon: 'time-outline',
    status: 'default',
    title: 'Press & hold',
    text: 'You don’t have this card',
  },
] as const;
