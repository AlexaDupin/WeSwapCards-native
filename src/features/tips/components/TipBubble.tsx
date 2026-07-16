import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Colors } from '@/src/constants/Colors';
import { tips, type TipKey } from '@/src/features/tips/data/tips';
import { useTip } from '@/src/features/tips/hooks/useTip';

type Props = {
  tipKey: TipKey;
};

/**
 * A dismissible first-run tip for one tab. Renders nothing once dismissed (or
 * while the persisted flag is still being read), so screens can drop it in
 * unconditionally.
 *
 * Floats over the bottom of the tab's content rather than displacing it — a
 * tutorial card the user reads and closes, not part of the layout. Screens sit
 * above the tab bar, so `bottom` clears the menu without knowing its height.
 *
 * Anchors to its parent's content box, so the host must be the screen's
 * unpadded root (a padded one would double the gutters) and must not scroll.
 */
export default function TipBubble({ tipKey }: Props) {
  const { status, dismiss } = useTip(tipKey);
  const tip = tips[tipKey];

  if (status !== 'unseen') return null;

  return (
    <View style={styles.bubble}>
      <Ionicons name={tip.icon} size={18} color="#fff" style={styles.icon} />

      <View style={styles.copy}>
        <Text style={styles.title}>{tip.title}</Text>
        <Text style={styles.body}>{tip.body}</Text>
      </View>

      <Pressable
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss tip"
        hitSlop={10}
        style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
      >
        <Ionicons name="close" size={16} color="rgba(255,255,255,0.75)" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 14,
    // Reads as floating above the content it covers rather than sitting in it.
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  // Nudges the icon onto the title's optical baseline.
  icon: {
    marginTop: 1,
  },
  copy: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.9)',
  },
  close: {
    padding: 2,
  },
  closePressed: {
    opacity: 0.5,
  },
});
