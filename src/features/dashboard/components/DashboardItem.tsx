import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { styles } from '@/src/assets/styles/dashboard.styles';
import { Colors } from '@/src/constants/Colors';

// TODO: broken import — should use DashboardItemData from feature types

import type { DashboardItemData } from '@/src/features/dashboard/types/DashboardItemType';

type Props = {
  item: DashboardItemData;
  unread: boolean;
  onToggleUnread: () => void;
  onPress: () => void;
};

function formatLastMessage(timestamp: string | null) {
  if (!timestamp) return '';
  const date = new Date(timestamp);

  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays <= 7) {
    return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(
      date,
    );
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
  }).format(date);
}

const DashboardItem = ({ item, unread, onToggleUnread, onPress }: Props) => {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);
  const swipeableRef = useRef<React.ComponentRef<typeof Swipeable> | null>(
    null,
  );

  const timeLabel = useMemo(
    () => formatLastMessage(item.last_message_at),
    [item.last_message_at],
  );

  const iconName = unread ? 'checkmark-done-outline' : 'checkmark-outline';
  const iconColor = unread ? Colors.primary : '#9aa0a6';

  const renderLeftActions = useCallback(() => {
    return (
      <TouchableOpacity
        style={styles.renderLeftUnread}
        onPress={() => {
          onToggleUnread();
          swipeableRef.current?.close();
        }}
      >
        <Ionicons name="mail-unread-outline" size={24} color="white" />
      </TouchableOpacity>
    );
  }, [onToggleUnread]);

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      leftThreshold={40}
      onSwipeableOpen={() => setIsSwipeOpen(true)}
      onSwipeableClose={() => setIsSwipeOpen(false)}
    >
      <View
        style={[
          styles.transactionCard,
          {
            borderTopLeftRadius: isSwipeOpen ? 0 : 12,
            borderBottomLeftRadius: isSwipeOpen ? 0 : 12,
          },
        ]}
      >
        <TouchableOpacity style={styles.transactionContent} onPress={onPress}>
          <View style={styles.categoryIconContainer}>
            <Ionicons name={iconName} size={22} color={iconColor} />
          </View>

          <View style={styles.transactionLeft}>
            <Text
              style={[
                styles.transactionTitle,
                unread ? { fontWeight: '700' } : null,
              ]}
              numberOfLines={1}
            >
              {item.card_name}
            </Text>
            <Text style={styles.transactionCategory} numberOfLines={1}>
              {item.swap_explorer}
            </Text>
          </View>

          <View style={styles.transactionRight}>
            <Text style={styles.transactionDate} numberOfLines={1}>
              {timeLabel}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
};

export default React.memo(DashboardItem);
