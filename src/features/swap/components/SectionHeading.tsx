import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/src/constants/Colors';

type Props = {
  /** The section's label, e.g. "Opportunities for" or "Latest chapters". */
  kicker: string;
  /** The subject the kicker names, when the section has one. */
  title?: string | null;
};

/**
 * The Swap screen's section header, in the app's kicker-over-title shape (see
 * LatestChaptersRow, which introduced it). Both of this screen's sections share
 * it so a standalone section and a labelled one read as the same furniture.
 *
 * The kicker is the constant; it grows and darkens when it stands alone, since
 * then it carries the section on its own rather than introducing a title that
 * anchors it.
 */
export default function SectionHeading({ kicker, title }: Props) {
  const standalone = !title;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.kicker, standalone && styles.kickerStandalone]}>
        {kicker}
      </Text>

      {title ? (
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 20,
    paddingBottom: 12,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: 'rgba(0,0,0,0.4)',
    marginBottom: 3,
  },
  kickerStandalone: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.55)',
    marginBottom: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
});
