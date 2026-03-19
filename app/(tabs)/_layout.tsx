import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import PageLoader from '@/src/components/PageLoader';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { Colors } from '@/src/constants/Colors';

const TabsLayout = () => {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { status, errorMessage, resetExplorer } = useExplorer();

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
        tabBarActiveTintColor: '#212529',
        tabBarInactiveTintColor: '#6C757D',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5D3B7',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '400',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: 'My cards',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="duplicate-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="swap"
        options={{
          title: 'Swap',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
