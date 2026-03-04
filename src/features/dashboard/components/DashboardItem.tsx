import React, { useCallback, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { styles } from '@/src/assets/styles/dashboard.styles';

import type { DashboardItemData } from '@/src/features/dashboard/types/DashboardTypes';
import { formatLastMessage } from '@/src/features/dashboard/utils/dashboardItemUtils';
import {
  DEFAULT_CARD_RADIUS,
  STATUS_ICON_MAP,
} from '@/src/features/dashboard/constants/dashboardItemConstants';

type Props = {
  item: DashboardItemData;
  unread: boolean;
  onMarkUnread: () => void;
  onMarkCompleted: () => void;
  onMarkDeclined: () => void;
  onPress: () => void;
};

const DashboardItem = ({
  item,
  unread,
  onMarkUnread,
  onMarkCompleted,
  onMarkDeclined,
  onPress,
}: Props) => {
  const [openDirection, setOpenDirection] = useState<'left' | 'right' | null>(
    null,
  );
  const swipeableRef = useRef<React.ComponentRef<typeof Swipeable> | null>(
    null,
  );

  const timeLabel = formatLastMessage(item.last_message_at);

  const { iconName, iconColor } = STATUS_ICON_MAP[item.status];
  const isLeftOpen = openDirection === 'left';
  const isRightOpen = openDirection === 'right';

  const closeSwipe = useCallback(() => {
    swipeableRef.current?.close();
  }, []);

  const runAndClose = useCallback(
    (action: () => void) => {
      action();
      closeSwipe();
    },
    [closeSwipe],
  );

  const renderLeftActions = useCallback(() => {
    return (
      <TouchableOpacity
        style={styles.renderLeftUnread}
        onPress={() => runAndClose(onMarkUnread)}
      >
        <Ionicons name="mail-unread-outline" size={24} color="white" />
      </TouchableOpacity>
    );
  }, [onMarkUnread, runAndClose]);

  const renderRightActions = useCallback(() => {
    return (
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.renderRightDecline}
          onPress={() => runAndClose(onMarkDeclined)}
        >
          <Ionicons name="close-circle" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.renderRightAccept}
          onPress={() => runAndClose(onMarkCompleted)}
        >
          <Ionicons name="checkmark-circle" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  }, [onMarkCompleted, onMarkDeclined, runAndClose]);

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      leftThreshold={40}
      rightThreshold={40}
      onSwipeableOpen={(direction) => setOpenDirection(direction)}
      onSwipeableClose={() => setOpenDirection(null)}
    >
      <View
        style={[
          styles.transactionCard,
          {
            borderTopLeftRadius: isRightOpen ? 0 : DEFAULT_CARD_RADIUS,
            borderBottomLeftRadius: isRightOpen ? 0 : DEFAULT_CARD_RADIUS,
            borderTopRightRadius: isLeftOpen ? 0 : DEFAULT_CARD_RADIUS,
            borderBottomRightRadius: isLeftOpen ? 0 : DEFAULT_CARD_RADIUS,
          },
        ]}
      >
        <TouchableOpacity style={styles.transactionContent} onPress={onPress}>
          <View style={styles.categoryIconContainer}>
            <View style={styles.unreadIconWrapper}>
              <Ionicons name={iconName} size={22} color={iconColor} />
              {unread && <View style={styles.unreadDot} />}
            </View>
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
