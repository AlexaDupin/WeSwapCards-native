import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PageLoader from '@/src/components/PageLoader';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { Colors } from '@/src/constants/Colors';
import { Fonts } from '@/src/constants/typography';

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

const ACTIVE_CIRCLE_SIZE = 40;

// Content height, excluding the device's bottom inset (added on top).
// Fits 4 paddingTop + 5 item padding + circle + ~14 label + 5 item padding.
const BASE_TAB_BAR_HEIGHT = 68;

// iOS reserves 34pt for the home indicator, which leaves a dead band under the
// labels. 20 clears the indicator without the gap. Android keeps its full inset
// (a 3-button nav bar is real chrome the labels must not sit under).
const MAX_IOS_BOTTOM_INSET = 20;

const TabsLayout = () => {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { status, errorMessage, resetExplorer } = useExplorer();
  const insets = useSafeAreaInsets();
  const bottomInset =
    Platform.OS === 'ios'
      ? Math.min(insets.bottom, MAX_IOS_BOTTOM_INSET)
      : insets.bottom;

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
            style={{
              fontFamily: Fonts.head.semibold,
              fontSize: 18,
              fontWeight: '600',
              textAlign: 'center',
            }}
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
            <Text
              style={{
                fontFamily: Fonts.head.semibold,
                color: '#fff',
                fontWeight: '600',
              }}
            >
              Retry
            </Text>
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
        // A softer charcoal than near-black: still ~8:1 on white (comfortably
        // past the 4.5:1 AA floor), but the pill, filled glyph, and bold label
        // below are carrying the "selected" signal now, so the tint doesn't
        // have to reach for maximum contrast on its own.
        tabBarActiveTintColor: '#495057',
        tabBarInactiveTintColor: '#6C757D',
        tabBarLabel: ({ focused, color, children }) => (
          <Text
            style={{
              fontFamily: focused ? Fonts.head.bold : Fonts.head.regular,
              fontSize: 11,
              fontWeight: focused ? '700' : '400',
              color,
            }}
          >
            {children}
          </Text>
        ),
        // Default slot is 31×28; without this the circle spills onto the label.
        tabBarIconStyle: {
          width: ACTIVE_CIRCLE_SIZE,
          height: ACTIVE_CIRCLE_SIZE,
        },
        // Height = fixed content height + the device's bottom inset; the inset
        // is reserved as paddingBottom so labels always sit just above the
        // system bar / home indicator and never draw behind it (edge-to-edge).
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5D3B7',
          borderTopWidth: 1,
          paddingTop: 4,
          paddingBottom: bottomInset,
          height: BASE_TAB_BAR_HEIGHT + bottomInset,
        },
      }}
    >
      <Tabs.Screen
        name="swap"
        options={{
          title: 'Search',
          tabBarIcon: (props) => (
            <TabIcon {...props} name="search-outline" activeName="search" />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Messages',
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
    </Tabs>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({
  iconWrap: {
    width: ACTIVE_CIRCLE_SIZE,
    height: ACTIVE_CIRCLE_SIZE,
    borderRadius: ACTIVE_CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
});
