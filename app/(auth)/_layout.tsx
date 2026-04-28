import PageLoader from '@/src/components/PageLoader'
import { Redirect, Stack, useSegments } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth()
  const segments = useSegments() as string[]
  const isRegisterUserRoute = segments.includes('register-user')

  if (!isLoaded) {
    return <PageLoader />
  }

  if (isSignedIn && !isRegisterUserRoute) {
    return <Redirect href={'/(tabs)/dashboard'} />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}