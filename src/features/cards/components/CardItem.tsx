import React, { useRef } from "react";
import { Text, View } from "react-native";
import { styles } from "@/src/assets/styles/cards.styles";
import type { CardItemData, CardStatus } from "@/src/features/cards/types/CardItemType";
import { LongPressGestureHandler, TapGestureHandler, State } from "react-native-gesture-handler";
import type {
  LongPressGestureHandlerStateChangeEvent,
  TapGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";

type Props = {
  item: CardItemData;
  status: CardStatus;
  onSelect: () => void;
  reset?: () => void;
  readOnly?: boolean;
  cardWidth?: number;
};

function CardItem({ item, status, onSelect, reset, readOnly = false, cardWidth }: Props) {
  const isOwned = status === "owned";
  const isDuplicated = status === "duplicated";
  const isDefault = status === "default";

  const longPressRef = useRef<LongPressGestureHandler>(null);
  const longPressEnabled = !readOnly && !isDefault && !!reset;

  return (
    <LongPressGestureHandler
      ref={longPressRef}
      enabled={longPressEnabled}
      minDurationMs={450}
      shouldCancelWhenOutside
      onHandlerStateChange={(
        event: LongPressGestureHandlerStateChangeEvent
      ) => {
        if (event.nativeEvent.state === State.ACTIVE) {
          reset?.();
        }
      }}
    >
      <TapGestureHandler
        waitFor={longPressEnabled ? longPressRef : undefined}
        enabled={!readOnly}
        onHandlerStateChange={(
          event: TapGestureHandlerStateChangeEvent
        ) => {
          if (event.nativeEvent.state === State.END) {
            onSelect();
          }
        }}
      >
        <View
          testID={`card-touch-${item.id}`}
          accessibilityRole="button"
          accessibilityLabel={`Card ${item.number} (${status})${readOnly ? " — sign in to log" : ""}`}
          style={styles.cardItemWrapper}
        >
          <View
            testID={`card-${item.id}`}
            style={[
              styles.cardItem,
              cardWidth ? { width: cardWidth } : null,
              isOwned || isDuplicated ? styles.cardItemOwned : styles.cardItemDefault,
            ]}
          >
            <View
              style={[
                styles.cardItemInner,
                isOwned || isDuplicated ? styles.cardItemInnerOwned : styles.cardItemInnerDefault,
              ]}
            >
              <Text style={[styles.cardNumber, (isOwned || isDuplicated) && styles.cardNumberOwned]}>
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
      </TapGestureHandler>
    </LongPressGestureHandler>
  );
}

export default React.memo(CardItem);