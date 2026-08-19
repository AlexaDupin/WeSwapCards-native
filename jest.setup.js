// Mocks the gesture-handler native module so Gesture/GestureDetector render in tests.
import 'react-native-gesture-handler/jestSetup';

// The chat screen's KeyboardAvoidingView comes from this native module; its
// bundled jest mock renders the components without the native bindings.
jest.mock('react-native-keyboard-controller', () =>
  require('react-native-keyboard-controller/jest'),
);

// Render Expo vector icons as lightweight host components in tests. The real
// module pulls in expo-font ESM that the project's transformIgnorePatterns does
// not transpile, so importing an icon would otherwise crash any component test.
// Covers both import styles used in the app (`@expo/vector-icons/Ionicons`
// default and the named `{ Ionicons }` export).
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
}));

// Same reason as the icons above: transformIgnorePatterns matches `expo` and
// `expo-modules-core` but not the hyphenated packages, so expo-image and
// expo-haptics reach Jest as untranspiled ESM and crash any suite that renders
// a remote image or a PressableScale. Both are boundaries rather than behavior
// under test.
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

// Same reason as the icons above: expo-secure-store is ESM that
// transformIgnorePatterns does not transpile, so any screen reaching it (the
// first-run tips, the onboarding carousel) would crash the suite. Defaulting
// getItemAsync to a stored value keeps that one-time UI out of screen tests
// that aren't about it; suites that exercise it mock this module themselves.
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('true'),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Screens read the device insets to keep their content clear of the status bar
// and the notch. In the app expo-router mounts the SafeAreaProvider, but screen
// tests render a screen on its own, and the real hook throws without a
// provider. Zero insets are the desktop/simulator-without-notch case: layout
// maths still runs, it just adds nothing.
jest.mock('react-native-safe-area-context', () => {
  const actual = jest.requireActual('react-native-safe-area-context');
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});
