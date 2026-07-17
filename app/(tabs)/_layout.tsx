import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageLoader from '@/src/components/PageLoader';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { Colors } from '@/src/constants/Colors';

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  activeName: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
};

// Selection has to read without leaning on tint alone: colour-blind users
// can't take hue as a signal, and it's the one WCAG explicitly calls out
// (1.4.1) as unsafe to be the *only* carrier of state. The filled glyph and
// this pill are the redundant signals that make it not the only one — the
// label's added weight (see tabBarLabel below) is the third.
function TabIcon({ name, activeName, color, size, focused }: TabIconProps) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={focused ? activeName : name} size={size} color={color} />
    </View>
  );
}

// Visual height of the tab bar content (icons + labels), independent of the
// device's bottom system inset. The inset is added on top: the iOS home
// indicator (~34px), an Android nav bar (gesture ~16–24px / 3-button ~48px),
// or 0 on home-button iPhones — so the bar fits every model.
//
// The icon+label render into (BASE_TAB_BAR_HEIGHT − paddingTop); the inset
// cancels out and never enlarges that area. Keep this >= ~56 so the label
// isn't clipped (Android needs ~48px of content; below that it overflows).
const BASE_TAB_BAR_HEIGHT = 56;

const TabsLayout = () => {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { status, errorMessage, resetExplorer } = useExplorer();
  const insets = useSafeAreaInsets();

  if (!isLoaded) return <PageLoader />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  if (status === 'idle' || status === 'loading') return <PageLoader />;
  if (status === 'needs_registration')
    return <Redirect href="/(auth)/register-user" />;
  if (status === 'error')
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <View style={{ maxWidth: 320, width: '100%', gap: 16 }}>
          <Text
            style={{ fontSize: 18, fontWeight: '600', textAlign: 'center' }}
          >
            Something went wrong
          </Text>

          <Text style={{ textAlign: 'center', color: '#666' }}>
            {errorMessage ?? 'We couldn’t load your profile. Please try again.'}
          </Text>

          <TouchableOpacity
            onPress={resetExplorer}
            style={{
              backgroundColor: Colors.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => void signOut()}
            style={{
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#666' }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Charcoal vs. grey is already the strongest-contrast pair available
        // here (~15.5:1 vs ~4.7:1 on white) — tint was never the weak link.
        // The tab felt unmarked because tone was the *only* thing that moved:
        // both states used the outline glyph at the same label weight. The
        // pill, filled glyph, and bold label below carry the rest.
        tabBarActiveTintColor: '#212529',
        tabBarInactiveTintColor: '#6C757D',
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            style={{ fontSize: 11, fontWeight: focused ? '700' : '400', color }}
          >
            {children}
          </Text>
        ),
        // Height = fixed content height + the device's bottom inset; the inset
        // is reserved as paddingBottom so labels always sit just above the
        // system bar / home indicator and never draw behind it (edge-to-edge).
        // This adapts to every model instead of hardcoding a single height.
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5D3B7',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          height: BASE_TAB_BAR_HEIGHT + insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: (props) => (
            <TabIcon
              {...props}
              name="chatbubbles-outline"
              activeName="chatbubbles"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: 'My cards',
          tabBarIcon: (props) => (
            <TabIcon
              {...props}
              name="duplicate-outline"
              activeName="duplicate"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="swap"
        options={{
          title: 'Swap',
          tabBarIcon: (props) => (
            <TabIcon {...props} name="search-outline" activeName="search" />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({
  // 30px keeps the pill inside the tab bar's tight content budget (48px for
  // icon + label, see BASE_TAB_BAR_HEIGHT) — a taller pill risks clipping the
  // label under it on Android.
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
});
