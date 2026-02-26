import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PageLoader from '@/src/components/PageLoader';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';

const TabsLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { status } = useExplorer();

  if (!isLoaded) return <PageLoader />;
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />;

  if (status === 'idle' || status === 'loading') return <PageLoader />;
  if (status === 'needs_registration')
    return <Redirect href="/(auth)/register-user" />;
  if (status === 'error') return <Redirect href="/(auth)/sign-in" />;

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
