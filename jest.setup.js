// Mocks the gesture-handler native module so Gesture/GestureDetector render in tests.
import 'react-native-gesture-handler/jestSetup';

// Render Expo vector icons as lightweight host components in tests. The real
// module pulls in expo-font ESM that the project's transformIgnorePatterns does
// not transpile, so importing an icon would otherwise crash any component test.
// Covers both import styles used in the app (`@expo/vector-icons/Ionicons`
// default and the named `{ Ionicons }` export).
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

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
