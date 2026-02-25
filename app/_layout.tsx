import SafeScreen from '@/src/components/SafeScreen';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ExplorerHydration } from '@/src/features/auth/components/ExplorerHydration';
import { ExplorerProvider } from '@/src/features/auth/context/ExplorerContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
        <ExplorerProvider>
          <ExplorerHydration>
            <SafeScreen>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />

                <Stack.Screen
                  name="(auth)"
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                  }}
                />

                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </SafeScreen>
          </ExplorerHydration>
        </ExplorerProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
