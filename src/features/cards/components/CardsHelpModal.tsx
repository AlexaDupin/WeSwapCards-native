import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles as cardsStyles } from '@/src/assets/styles/cards.styles';
import {
  CARDS_HELP_TITLE,
  cardsHelpItems,
  type CardsHelpItem,
} from '@/src/features/cards/data/cardsHelpItems';

type Props = {
  visible: boolean;
  onClose: () => void;
};

// The preview reuses the live tile styles rather than redrawing them, so the
// legend cannot drift from the real grid when the tiles are restyled.
function HelpCardPreview({ status }: { status: CardsHelpItem['status'] }) {
  const isOwned = status === 'owned' || status === 'duplicated';

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        cardsStyles.cardItem,
        isOwned ? cardsStyles.cardItemOwned : cardsStyles.cardItemDefault,
      ]}
    >
      <Text
        style={[cardsStyles.cardNumber, isOwned && cardsStyles.cardNumberOwned]}
      >
        1
      </Text>

      {status === 'duplicated' && (
        <View style={cardsStyles.duplicateBadge}>
          <Ionicons name="swap-horizontal" size={9} color="#fff" />
        </View>
      )}
    </View>
  );
}

function HelpRow({ item }: { item: CardsHelpItem }) {
  return (
    <View
      accessible
      accessibilityLabel={`${item.title} — ${item.text}`}
      style={styles.row}
    >
      <View style={styles.gesture}>
        <Ionicons name={item.gesture} size={20} color="#555" />
        {item.modifierIcon ? (
          <Ionicons name={item.modifierIcon} size={12} color="#555" />
        ) : null}
        {item.modifierText ? (
          <Text style={styles.modifierText}>{item.modifierText}</Text>
        ) : null}
      </View>

      <HelpCardPreview status={item.status} />

      <View style={styles.caption}>
        <Text style={styles.captionTitle}>{item.title}</Text>
        <Text style={styles.captionText}>{item.text}</Text>
      </View>
    </View>
  );
}

export default function CardsHelpModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <ScrollView>
            <Text style={styles.title}>{CARDS_HELP_TITLE}</Text>

            {cardsHelpItems.map((item) => (
              <HelpRow key={item.title} item={item} />
            ))}

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>Got it</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    maxHeight: '85%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  gesture: {
    width: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  modifierText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  caption: {
    flex: 1,
  },
  captionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  captionText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.8,
  },
});
