import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View } from 'react-native'
import Swap from "../(tabs)/swap";
import { SignOutButton } from '@/components/SignOutButton'

export default function Page() {
  const { user } = useUser()

  return (
    <View>
      <SignedIn>
        <Swap />
      </SignedIn>
      <SignedOut>
        <Link href="/(auth)/sign-in">
          <Text>Sign in</Text>
        </Link>
      </SignedOut>
    </View>
  )
}

//   return (
//     <View>
//       <SignedIn>
//         <Dashboard />
//         <SignOutButton />
//       </SignedIn>
//       <SignedOut>
//         <Link href="/(auth)/sign-in">
//           <Text>Sign in</Text>
//         </Link>
//         <Link href="/(auth)/sign-up">
//           <Text>Sign up</Text>
//         </Link>
//       </SignedOut>
//     </View>
//   )
// }