import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStyles } from '../../src/assets/styles/auth.styles';
import { styles } from '../../src/assets/styles/styles';
import { useSignInSubmit } from '@/src/features/auth/hooks/useSignInSubmit';
import PasswordInput from '@/src/components/PasswordInput';

export default function SignInScreen() {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { onSignInPress } = useSignInSubmit({
    emailAddress,
    password,
    isSubmitting,
    setIsSubmitting,
    setError,
    redirectTo: '/(tabs)/cards',
  });

  const clearError = () => setError('');

  return (
    <>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 + insets.top }}>
        <TouchableOpacity
          onPress={() => router.replace('/')}
          style={{ alignSelf: 'flex-start', padding: 8 }}
          hitSlop={10}
        >
          <Ionicons name="close" size={22} />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        // Content is centered so it normally clears the bottom edge, but when
        // it overflows (keyboard open, large font scale) the scrolled end must
        // clear the edge-to-edge Android nav/gesture bar.
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={30}
      >
        <View style={authStyles.container}>
          <Text style={authStyles.title}>Sign in</Text>

          <View style={authStyles.subtitle}>
            <Text style={authStyles.subtitleText}>Welcome back!</Text>
            <Text style={authStyles.subtitleText}>
              Please sign in to continue
            </Text>
          </View>

          {error ? (
            <View style={authStyles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={'#E74C3C'} />
              <Text style={authStyles.errorText}>{error}</Text>
              <TouchableOpacity onPress={clearError}>
                <Ionicons name="close" size={20} color={'#9A8478'} />
              </TouchableOpacity>
            </View>
          ) : null}

          <TextInput
            style={authStyles.input}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="username"
            autoComplete="email"
            value={emailAddress}
            placeholder="Enter email"
            onChangeText={(value: string) => {
              setEmailAddress(value);
              if (error) clearError();
            }}
            returnKeyType="next"
          />
          <PasswordInput
            value={password}
            onChangeText={(value: string) => {
              setPassword(value);
              if (error) clearError();
            }}
            onSubmitEditing={onSignInPress}
            textContentType="password"
            autoComplete="password"
          />

          <TouchableOpacity
            style={[styles.button, isSubmitting && { opacity: 0.6 }]}
            onPress={onSignInPress}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Text>
          </TouchableOpacity>

          <View style={authStyles.footerContainer}>
            <Text style={authStyles.footerText}>
              Don&apos;t have an account?
            </Text>

            <Link href="/sign-up" asChild>
              <TouchableOpacity>
                <Text style={{ fontWeight: '600', fontSize: 16 }}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}
