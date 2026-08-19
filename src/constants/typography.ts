/**
 * The three-family type stack shared with the web app
 * (WeSwapCards/front/src/styles/index.scss, commit f1f1043).
 *
 * - Gabarito           headings, titles and button labels
 * - Hanken Grotesk     body and secondary text
 * - Plus Jakarta Sans  the WeSwapCards wordmark only, at 800
 *
 * React Native does not synthesize weights for custom fonts: `fontWeight` is
 * ignored once `fontFamily` names a bundled face, so each weight has to be its
 * own registered family. That is why styles name a face here rather than
 * setting a numeric weight. Existing `fontWeight` values are left in place so
 * the system fallback still renders sensibly if a font ever fails to load.
 *
 * These are plain strings on purpose. The matching font *files* live in
 * `fontAssets.ts`, which only the root layout imports, so the ~30 stylesheets
 * that need family names never pull expo-font and a pile of TTFs into the
 * bundle graph (or into every test suite).
 */
export const Fonts = {
  /** Display face: headings, titles, button labels. */
  head: {
    regular: 'Gabarito_400Regular',
    medium: 'Gabarito_500Medium',
    semibold: 'Gabarito_600SemiBold',
    bold: 'Gabarito_700Bold',
    extrabold: 'Gabarito_800ExtraBold',
  },
  /** Text face: body copy, labels, secondary text. */
  body: {
    regular: 'HankenGrotesk_400Regular',
    medium: 'HankenGrotesk_500Medium',
    semibold: 'HankenGrotesk_600SemiBold',
    bold: 'HankenGrotesk_700Bold',
  },
  /** The wordmark, and nothing else. */
  wordmark: 'PlusJakartaSans_800ExtraBold',
} as const;
