import { useState } from 'react'
import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { authStyles } from "../../assets/styles/auth.styles";
import { styles } from "../../assets/styles/styles";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState("");

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/(tabs)/dashboard')
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
        console.error(JSON.stringify(err, null, 2))

        if (err.errors?.[0]?.code === "form_password_incorrect") {
            setError("Password is incorrect. Please try again.");
          } else {
            setError("An error occurred. Please try again.");
          }
    }
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={30}
    >

    <View style={authStyles.container}>
      <Text style={authStyles.title}>Sign in</Text>

      <View style={authStyles.subtitle}>
        <Text style={authStyles.subtitleText}>Welcome back!</Text>
        <Text style={authStyles.subtitleText}>Please sign in to continue</Text>
      </View>

        {error ? (
          <View style={authStyles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={"#E74C3C"}/>
            <Text style={authStyles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={"#9A8478"} />
            </TouchableOpacity>
          </View>
        ) : null}

      <TextInput
        style={[authStyles.input, error && authStyles.errorInput]}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
      />
      <TextInput
        style={[authStyles.input, error && authStyles.errorInput]}
        value={password}
        placeholder="Enter password"
        secureTextEntry={true}
        onChangeText={(password) => setPassword(password)}
      />

      <TouchableOpacity style={styles.button} onPress={onSignInPress}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <View style={authStyles.footerContainer}>
        <Text style={authStyles.footerText}>Don&apos;t have an account?</Text>

        <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text style={{fontWeight: "600", fontSize: 16}}>Sign up</Text>
            </TouchableOpacity>
        </Link>
                
        {/* <Link href="/">
          <Text>Home</Text>
        </Link> */}

      </View>
    </View>
    </KeyboardAwareScrollView>
  )
}