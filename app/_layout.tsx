import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ExplorerHydration } from '@/src/features/auth/components/ExplorerHydration';
import { ExplorerProvider } from '@/src/features/auth/context/ExplorerContext';
import { NotificationsProvider } from '@/src/features/notifications/NotificationsProvider';

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        {...(tokenCache ? { tokenCache } : {})}
        {...(publishableKey ? { publishableKey } : {})}
      >
        <ExplorerProvider>
          <ExplorerHydration>
            <NotificationsProvider>
              {/* Every screen's background now runs behind the status bar (see the
                  per-screen paddingTop: insets.top changes), and they're all
                  light — so the clock/battery icons need the dark variant to
                  stay legible. If a screen ever gets a dark top background,
                  it'll need to override this locally with its own <StatusBar>. */}
              <StatusBar style="dark" />

              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />

                <Stack.Screen
                  name="onboarding"
                  options={{ headerShown: false }}
                />

                <Stack.Screen
                  name="(auth)"
                  options={{
                    presentation: 'modal',
                    headerShown: false,
                  }}
                />

                <Stack.Screen
                  name="(modal)"
                  options={{ presentation: 'modal', headerShown: false }}
                />

                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </NotificationsProvider>
          </ExplorerHydration>
        </ExplorerProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
