import SafeScreen from "@/src/components/SafeScreen";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      >
        <SafeScreen>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />

            {/* Present auth as a modern modal sheet */}
            <Stack.Screen
              name="(auth)"
              options={{
                presentation: "modal",
                headerShown: false,
              }}
            />

            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </SafeScreen>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}




// import SafeScreen from "@/src/components/SafeScreen";
// import { ClerkProvider } from '@clerk/clerk-expo';
// import { tokenCache } from '@clerk/clerk-expo/token-cache';
// import { Slot } from "expo-router";
// import { GestureHandlerRootView } from 'react-native-gesture-handler';

// export default function RootLayout() {
//   return (
//     <GestureHandlerRootView>
//       <ClerkProvider tokenCache={tokenCache} publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
//         <SafeScreen>
//           <Slot />
//         </SafeScreen>
//       </ClerkProvider>
//     </GestureHandlerRootView>
//   )
// }
