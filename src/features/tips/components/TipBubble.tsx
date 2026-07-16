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
 * Deliberately layout-neutral: no horizontal margin, since the three tabs pad
 * their content differently. The host screen places it.
 */
export default function TipBubble({ tipKey }: Props) {
  const { status, dismiss } = useTip(tipKey);
  const tip = tips[tipKey];

  if (status !== 'unseen') return null;

  return (
    <View style={styles.bubble}>
      <Ionicons
        name={tip.icon}
        size={18}
        color={Colors.darkerPrimary}
        style={styles.icon}
      />

      <View style={styles.copy}>
        <Text style={styles.title}>{tip.title}</Text>
        <Text style={styles.body}>{tip.body}</Text>
      </View>

      <Pressable
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss tip"
        hitSlop={8}
        style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
      >
        <Ionicons name="close" size={16} color={Colors.onboardingMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.verylightPrimary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.lightPrimary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
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
    color: Colors.onboardingText,
    marginBottom: 3,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.onboardingMuted,
  },
  close: {
    padding: 2,
  },
  closePressed: {
    opacity: 0.5,
  },
});
