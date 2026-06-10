module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Restore spied-on implementations (e.g. console.error) before each test so
  // spies don't stack across a file.
  restoreMocks: true,
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-navigation|@react-navigation|expo(nent)?|@expo(nent)?|expo-modules-core|react-native-gesture-handler|react-native-reanimated|react-native-svg)/)',
  ],
};
