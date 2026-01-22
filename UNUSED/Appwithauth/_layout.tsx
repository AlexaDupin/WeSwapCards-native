import { ClerkProvider } from '@clerk/clerk-expo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Slot } from "expo-router";
import SafeScreen from "@/src/components/SafeScreen";

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
    {/* <ClerkProvider tokenCache={tokenCache}> */}
      <SafeScreen>
        <Slot />
      </SafeScreen>
    {/* </ClerkProvider> */}
    </GestureHandlerRootView>
  )
}
