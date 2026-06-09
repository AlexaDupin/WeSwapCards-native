// Mocks the gesture-handler native module so Gesture/GestureDetector render in tests.
import 'react-native-gesture-handler/jestSetup';

// Render Expo vector icons as lightweight host components in tests. The real
// module pulls in expo-font ESM that the project's transformIgnorePatterns does
// not transpile, so importing an icon would otherwise crash any component test.
// Covers both import styles used in the app (`@expo/vector-icons/Ionicons`
// default and the named `{ Ionicons }` export).
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
