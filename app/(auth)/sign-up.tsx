import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { authStyles } from "../../src/assets/styles/auth.styles";
import { styles } from "../../src/assets/styles/styles";
import { useSignUpSubmit } from "@/src/features/auth/hooks/useSignUpSubmit";

export default function SignUpScreen() {
  const [emailAddress, setEmailAddress] = useState('')
  const [password, setPassword] = useState('')
  const [pendingVerification, setPendingVerification] = useState(false)
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { onSignUpPress, onVerifyPress } = useSignUpSubmit({
    emailAddress,
    password,
    code,
    pendingVerification,
    setPendingVerification,
    isSubmitting,
    setIsSubmitting,
    setError,
    redirectTo: "/",
  });

  const clearError = () => setError("");

  return (
    <>
    <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
      <TouchableOpacity
        onPress={() => router.replace("/")}
        style={{ alignSelf: "flex-start", padding: 8 }}
        hitSlop={10}
      >
        <Ionicons name="close" size={22} />
      </TouchableOpacity>
    </View>
    
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={30}
    >

        <View style={authStyles.container}>
          <Text style={authStyles.title}>
            {pendingVerification ? "Verify your email" : "Create an account"}
          </Text>

          <View style={authStyles.subtitle}>
            {pendingVerification ? (
              <>
                <Text style={authStyles.subtitleText}>
                  We sent you a verification code.
                </Text>
                <Text style={authStyles.subtitleText}>
                  Enter it below to finish creating your account.
                </Text>
              </>
            ) : (
              <>
                <Text style={authStyles.subtitleText}>Welcome!</Text>
                <Text style={authStyles.subtitleText}>
                  Please fill in the details to get started
                </Text>
              </>
            )}
          </View>

          {error ? (
            <View style={authStyles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={"#E74C3C"} />
              <Text style={authStyles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Ionicons name="close" size={20} color={"#9A8478"} />
              </TouchableOpacity>
            </View>
          ) : null}

          {pendingVerification ? (
            <>
              <TextInput
                style={[authStyles.input, error && authStyles.errorInput]}
                value={code}
                placeholder="Enter verification code"
                keyboardType="numeric"
                onChangeText={(value: string) => {
                  setCode(value);
                  if (error)
                    clearError();
                } }
                returnKeyType="done"
                onSubmitEditing={onVerifyPress} />

              <TouchableOpacity
                style={[styles.button, isSubmitting && { opacity: 0.6 }]}
                onPress={onVerifyPress}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? "Verifying..." : "Verify"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={[authStyles.input, error && authStyles.errorInput]}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="username"
                autoComplete="email"
                value={emailAddress}
                placeholder="Enter email"
                onChangeText={(value: string) => {
                  setEmailAddress(value);
                  if (error)
                    clearError();
                } }
                returnKeyType="next" />

              <TextInput
                style={[authStyles.input, error && authStyles.errorInput]}
                value={password}
                placeholder="Enter password"
                secureTextEntry
                textContentType="newPassword"
                autoComplete="password-new"
                onChangeText={(value: string) => {
                  setPassword(value);
                  if (error)
                    clearError();
                } }
                returnKeyType="done"
                onSubmitEditing={onSignUpPress} />

              <TouchableOpacity
                style={[styles.button, isSubmitting && { opacity: 0.6 }]}
                onPress={onSignUpPress}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? "Creating..." : "Continue"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={authStyles.footerContainer}>
            <Text style={authStyles.footerText}>
              Already have an account?
            </Text>

            <Link href="/sign-in" asChild>
              <TouchableOpacity>
                <Text style={{ fontWeight: "600", fontSize: 16 }}>Sign in</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/">
              <Text>Home</Text>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView></>
  )
}