import { useEffect } from 'react';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ApiAuthErrorHandler } from '@/src/features/auth/components/ApiAuthErrorHandler';
import { ExplorerHydration } from '@/src/features/auth/components/ExplorerHydration';
import { ExplorerProvider } from '@/src/features/auth/context/ExplorerContext';
import { NotificationsProvider } from '@/src/features/notifications/NotificationsProvider';
import { fontAssets } from '@/src/constants/fontAssets';

// Held until the fonts are ready, so no screen renders in the system face and
// then reflows into Gabarito once they load.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    // A font failure must not trap the user behind the splash screen: the
    // styles keep their numeric fontWeight, so the system face still renders.
    if (fontsLoaded || fontError) void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ClerkProvider
          {...(tokenCache ? { tokenCache } : {})}
          {...(publishableKey ? { publishableKey } : {})}
        >
          <ExplorerProvider>
            {/* Signs out on API 401s so a server-rejected session can't linger. */}
            <ApiAuthErrorHandler />
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

                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </NotificationsProvider>
            </ExplorerHydration>
          </ExplorerProvider>
        </ClerkProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
