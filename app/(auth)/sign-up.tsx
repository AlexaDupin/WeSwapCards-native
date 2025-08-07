import { useState } from 'react'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { authStyles } from "../../assets/styles/auth.styles";
import { styles } from "../../assets/styles/styles";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState('')
  const [error, setError] = useState("");

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return

    console.log(emailAddress, password)

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
        legalAccepted: true,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
        console.error(JSON.stringify(err, null, 2))

        if (err.errors?.[0]?.code === "form_identifier_exists") {
          setError("That email address is already in use. Please try another.");
        } else {
          setError(err.errors?.[0]?.message);
        }
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <>
        <Text>Verify your email</Text>
        <TextInput
          value={code}
          placeholder="Enter your verification code"
          onChangeText={(code) => setCode(code)}
        />
        <TouchableOpacity onPress={onVerifyPress}>
          <Text>Verify</Text>
        </TouchableOpacity>
      </>
    )
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
      <>
        <Text style={authStyles.title}>Create an account</Text>

        <View style={authStyles.subtitle}>
            <Text style={authStyles.subtitleText}>Welcome!</Text>
            <Text style={authStyles.subtitleText}>Please fill in the details to get started</Text>
        </View>

        {error ? (
          <View style={authStyles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={"#E74C3C"} />
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
          onChangeText={(email) => setEmailAddress(email)}
        />
        <TextInput
          style={[authStyles.input, error && authStyles.errorInput]}
          value={password}
          placeholder="Enter password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />

        <TouchableOpacity style={styles.button} onPress={onSignUpPress}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <View style={authStyles.footerContainer}>
          <Text style={authStyles.footerText}>Already have an account?</Text>

          <Link href="/sign-in" asChild>
            <TouchableOpacity>
                <Text style={{fontWeight: "600", fontSize: 16}}>Sign in</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/">
            <Text>Home</Text>
          </Link>

        </View>
      </>
    </View>
    </KeyboardAwareScrollView>
  )
}