/**
 * The font files behind the family names in `typography.ts`, passed to
 * `useFonts` in the root layout. Each key becomes the string a `fontFamily`
 * refers to, so the two files must stay in step.
 *
 * The TTFs are required by path rather than imported from the package index.
 * Each `@expo-google-fonts` index re-exports every weight it ships as a
 * `require()`, and Metro cannot tree-shake those, so importing from the index
 * bundles all 38 faces (about 2.8 MB) instead of the 10 in use. Requiring the
 * files directly keeps only these. None of the three packages declares an
 * `exports` map, so the subpaths are stable public files.
 *
 * Kept apart from `typography.ts` so the ~30 stylesheets that need family
 * names do not drag expo-font and a pile of TTFs along with them.
 */
export const fontAssets = {
  Gabarito_400Regular: require('@expo-google-fonts/gabarito/400Regular/Gabarito_400Regular.ttf'),
  Gabarito_500Medium: require('@expo-google-fonts/gabarito/500Medium/Gabarito_500Medium.ttf'),
  Gabarito_600SemiBold: require('@expo-google-fonts/gabarito/600SemiBold/Gabarito_600SemiBold.ttf'),
  Gabarito_700Bold: require('@expo-google-fonts/gabarito/700Bold/Gabarito_700Bold.ttf'),
  Gabarito_800ExtraBold: require('@expo-google-fonts/gabarito/800ExtraBold/Gabarito_800ExtraBold.ttf'),
  HankenGrotesk_400Regular: require('@expo-google-fonts/hanken-grotesk/400Regular/HankenGrotesk_400Regular.ttf'),
  HankenGrotesk_500Medium: require('@expo-google-fonts/hanken-grotesk/500Medium/HankenGrotesk_500Medium.ttf'),
  HankenGrotesk_600SemiBold: require('@expo-google-fonts/hanken-grotesk/600SemiBold/HankenGrotesk_600SemiBold.ttf'),
  HankenGrotesk_700Bold: require('@expo-google-fonts/hanken-grotesk/700Bold/HankenGrotesk_700Bold.ttf'),
  PlusJakartaSans_800ExtraBold: require('@expo-google-fonts/plus-jakarta-sans/800ExtraBold/PlusJakartaSans_800ExtraBold.ttf'),
};
