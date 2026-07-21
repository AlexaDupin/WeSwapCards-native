import { useWindowDimensions } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import {
  authCompactStyles,
  authStyles,
  isCompactAuth,
} from '@/src/assets/styles/auth.styles';
import { styles } from '@/src/assets/styles/styles';

type AuthLayout = {
  /** True on short devices. Forward to PasswordInput, which owns its margins. */
  compact: boolean;
  container: StyleProp<ViewStyle>;
  title: StyleProp<TextStyle>;
  subtitle: StyleProp<ViewStyle>;
  subtitleText: StyleProp<TextStyle>;
  input: StyleProp<TextStyle>;
  button: StyleProp<ViewStyle>;
};

/**
 * Resolves the shared auth spacing against the current screen height.
 *
 * Every auth screen goes through this hook so the whole flow switches to the
 * compact layout together. Applying it per-screen made the title and its
 * margins visibly change size when moving between sign-in and sign-up.
 */
export function useAuthLayout(): AuthLayout {
  const { height } = useWindowDimensions();
  const compact = isCompactAuth(height);

  return {
    compact,
    container: [authStyles.container, compact && authCompactStyles.container],
    title: [authStyles.title, compact && authCompactStyles.title],
    subtitle: [authStyles.subtitle, compact && authCompactStyles.subtitle],
    subtitleText: [
      authStyles.subtitleText,
      compact && authCompactStyles.subtitleText,
    ],
    input: [authStyles.input, compact && authCompactStyles.input],
    button: [styles.button, compact && authCompactStyles.button],
  };
}
