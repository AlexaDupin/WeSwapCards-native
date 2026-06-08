import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '@/src/assets/styles/cards.styles';
import type {
  CardItemData,
  CardStatus,
} from '@/src/features/cards/types/CardItemType';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

type Props = {
  item: CardItemData;
  status: CardStatus;
  onSelect: (id: number) => void;
  reset?: ((id: number) => void) | undefined;
  readOnly?: boolean;
  cardWidth?: number;
};

function CardItem({
  item,
  status,
  onSelect,
  reset,
  readOnly = false,
  cardWidth,
}: Props) {
  const isOwned = status === 'owned';
  const isDuplicated = status === 'duplicated';
  const isDefault = status === 'default';

  const longPressEnabled = !readOnly && !isDefault && !!reset;

  const tap = Gesture.Tap()
    .enabled(!readOnly)
    .runOnJS(true)
    .withTestId(`tap-${item.id}`)
    .onEnd((_event, success) => {
      if (success) onSelect(item.id);
    });

  const longPress = Gesture.LongPress()
    .enabled(longPressEnabled)
    .minDuration(450)
    .shouldCancelWhenOutside(true)
    .runOnJS(true)
    .withTestId(`longpress-${item.id}`)
    .onStart(() => {
      reset?.(item.id);
    });

  // Tap waits for the long press to fail before firing (Exclusive gives the
  // long press priority), matching the previous waitFor behavior.
  const gesture = Gesture.Exclusive(longPress, tap);

  return (
    <GestureDetector gesture={gesture}>
      <View
        testID={`card-touch-${item.id}`}
        accessibilityRole="button"
        accessibilityLabel={`Card ${item.number} (${status})${readOnly ? ' — sign in to log' : ''}`}
        style={styles.cardItemWrapper}
      >
        <View
          testID={`card-${item.id}`}
          style={[
            styles.cardItem,
            cardWidth ? { width: cardWidth } : null,
            isOwned || isDuplicated
              ? styles.cardItemOwned
              : styles.cardItemDefault,
          ]}
        >
          <View
            style={[
              styles.cardItemInner,
              isOwned || isDuplicated
                ? styles.cardItemInnerOwned
                : styles.cardItemInnerDefault,
            ]}
          >
            <Text
              style={[
                styles.cardNumber,
                (isOwned || isDuplicated) && styles.cardNumberOwned,
              ]}
            >
              {item.number}
            </Text>
          </View>

          {isDuplicated && (
            <View testID={`badge-${item.id}`} style={styles.duplicateBadge}>
              <Text style={styles.duplicateBadgeText}>+</Text>
            </View>
          )}
        </View>
      </View>
    </GestureDetector>
  );
}

export default React.memo(CardItem);
