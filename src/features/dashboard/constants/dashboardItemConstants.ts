import type Ionicons from '@expo/vector-icons/Ionicons';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export type StatusIcon = {
  iconName: IoniconName;
  iconColor: string;
};

export const DEFAULT_CARD_RADIUS = 12;

export const STATUS_ICON_MAP: Record<
  'Completed' | 'Declined' | 'In progress',
  StatusIcon
> = {
  Completed: {
    iconName: 'checkmark-circle',
    iconColor: '#34C759',
  },
  Declined: {
    iconName: 'close-circle',
    iconColor: '#FF3B30',
  },
  'In progress': {
    iconName: 'chatbubble-outline',
    iconColor: '#9aa0a6',
  },
};
