import { Ionicons } from "@expo/vector-icons";
import { Link } from 'expo-router';
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { authStyles } from "../../src/assets/styles/auth.styles";
import { styles } from "../../src/assets/styles/styles";
import { useSignInSubmit } from "@/src/features/auth/hooks/useSignInSubmit";

export default function SignInScreen() {
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { onSignInPress } = useSignInSubmit({
    emailAddress,
    password,
    isSubmitting,
    setIsSubmitting,
    setError,
    redirectTo: "/(tabs)/cards",
  });

  const clearError = () => setError("");

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
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={20} color={"#9A8478"} />
            </TouchableOpacity>
          </View>
        ) : null}

      <TextInput
        style={[authStyles.input, error && authStyles.errorInput]}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="username"
        autoComplete="email"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={(value: string) => { setEmailAddress(value); if (error) clearError(); }}
        returnKeyType="next"
      />
      <TextInput
        style={[authStyles.input, error && authStyles.errorInput]}
        value={password}
        placeholder="Enter password"
        secureTextEntry
        textContentType="password"
        autoComplete="password"
        autoCorrect={false}
        onChangeText={(value: string) => { setPassword(value); if (error) clearError(); }}
        returnKeyType="done"
        onSubmitEditing={onSignInPress}
      />

      <TouchableOpacity 
        style={[styles.button, isSubmitting && { opacity: 0.6 }]}
        onPress={onSignInPress}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>{isSubmitting ? "Signing in..." : "Sign in"}</Text>
      </TouchableOpacity>

      <View style={authStyles.footerContainer}>
        <Text style={authStyles.footerText}>Don&apos;t have an account?</Text>

        <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text style={{fontWeight: "600", fontSize: 16}}>Sign up</Text>
            </TouchableOpacity>
        </Link>
                
        <Link href="/">
          <Text>Home</Text>
        </Link>

      </View>
    </View>
    </KeyboardAwareScrollView>
  )
}