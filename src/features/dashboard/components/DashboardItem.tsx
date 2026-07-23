import React, { useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { styles } from '@/src/assets/styles/dashboard.styles';

import type { DashboardItemData } from '@/src/features/dashboard/types/DashboardTypes';
import { formatLastMessage } from '@/src/features/dashboard/utils/dashboardItemUtils';
import { STATUS_ICON_MAP } from '@/src/features/dashboard/constants/dashboardItemConstants';
import ConversationAvatar from '@/src/features/dashboard/components/ConversationAvatar';

type Props = {
  item: DashboardItemData;
  unread: boolean;
  // Whether this row lives in the "Past" tab, where the resolved status
  // (Completed / Declined) is shown after the card name. Driven by the active
  // tab, not inferred from item.status.
  showPastStatus: boolean;
  onMarkUnread: () => void;
  onMarkCompleted: () => void;
  onMarkDeclined: () => void;
  onPress: () => void;
};

// Completed/Declined only; "In progress" never shows a label. Colours reuse the
// existing status source so green/red stay consistent with the rest of the app.
const getStatusMeta = (status: DashboardItemData['status']) => {
  if (status === 'Completed' || status === 'Declined') {
    return { label: status, color: STATUS_ICON_MAP[status].iconColor };
  }
  return null;
};

const DashboardItem = ({
  item,
  unread,
  showPastStatus,
  onMarkUnread,
  onMarkCompleted,
  onMarkDeclined,
  onPress,
}: Props) => {
  const swipeableRef = useRef<React.ComponentRef<typeof Swipeable> | null>(
    null,
  );

  const timeLabel = formatLastMessage(item.last_message_at);
  const statusMeta = showPastStatus ? getStatusMeta(item.status) : null;

  // Some card names carry trailing/embedded whitespace (e.g. "Jakarta3\n").
  // Collapse it to a single line so an embedded newline can't push the inline
  // status onto a second, clipped line (numberOfLines={1}).
  const cardName = item.card_name.replace(/\s+/g, ' ').trim();

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

  const accessibilityLabel = [
    item.swap_explorer,
    cardName,
    statusMeta?.label,
    unread ? 'Unread' : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      leftThreshold={40}
      rightThreshold={40}
    >
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <ConversationAvatar
          imageUrl={item.swap_explorer_image}
          name={item.swap_explorer}
          seed={item.swap_explorer_id}
          size={48}
        />

        <View style={styles.rowMiddle}>
          <Text
            style={[styles.rowUsername, unread && styles.rowUsernameUnread]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.swap_explorer}
          </Text>
          <Text
            style={[styles.rowSecondary, unread && styles.rowSecondaryUnread]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {cardName}
            {statusMeta ? (
              <Text>
                {' · '}
                <Text style={{ color: statusMeta.color }}>
                  {statusMeta.label}
                </Text>
              </Text>
            ) : null}
          </Text>
        </View>

        <View style={styles.rowRight}>
          <Text
            style={[styles.rowDate, unread && styles.rowDateUnread]}
            numberOfLines={1}
          >
            {timeLabel}
          </Text>
          {unread && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default React.memo(DashboardItem);
