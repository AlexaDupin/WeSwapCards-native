import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  authCompactStyles,
  authStyles,
  isCompactAuth,
} from '../../src/assets/styles/auth.styles';
import { styles } from '../../src/assets/styles/styles';
import { useSignUpSubmit } from '@/src/features/auth/hooks/useSignUpSubmit';
import PasswordInput from '@/src/components/PasswordInput';
import LegalConsentCheckbox from '@/src/features/auth/components/LegalConsentCheckbox';

export default function SignUpScreen() {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();

  // Sign-up stacks the most content of any auth screen (title, subtitle, two
  // inputs, the consent checkbox, the button and the footer link). On short
  // devices the shared auth spacing pushes "Already have an account?" below the
  // fold, so tighten it enough for everything to fit without scrolling.
  const compact = isCompactAuth(height);

  const { onSignUpPress, onVerifyPress } = useSignUpSubmit({
    emailAddress,
    password,
    code,
    legalAccepted: termsAccepted,
    pendingVerification,
    setPendingVerification,
    isSubmitting,
    setIsSubmitting,
    setError,
    redirectTo: '/(auth)/register-user',
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
        <View
          style={[authStyles.container, compact && authCompactStyles.container]}
        >
          <Text style={[authStyles.title, compact && authCompactStyles.title]}>
            {pendingVerification ? 'Verify your email' : 'Create an account'}
          </Text>

          <View
            style={[authStyles.subtitle, compact && authCompactStyles.subtitle]}
          >
            {pendingVerification ? (
              <>
                <Text
                  style={[
                    authStyles.subtitleText,
                    compact && authCompactStyles.subtitleText,
                  ]}
                >
                  We sent you a verification code.
                </Text>
                <Text
                  style={[
                    authStyles.subtitleText,
                    compact && authCompactStyles.subtitleText,
                  ]}
                >
                  Enter it below to finish creating your account.
                </Text>
              </>
            ) : (
              <>
                <Text
                  style={[
                    authStyles.subtitleText,
                    compact && authCompactStyles.subtitleText,
                  ]}
                >
                  Welcome!
                </Text>
                <Text
                  style={[
                    authStyles.subtitleText,
                    compact && authCompactStyles.subtitleText,
                  ]}
                >
                  Please fill in the details to get started
                </Text>
              </>
            )}
          </View>

          {error ? (
            <View style={authStyles.errorBox}>
              <Ionicons name="alert-circle" size={20} color={'#E74C3C'} />
              <Text style={authStyles.errorText}>
                {error.split(/(sign in)/i).map((part, index) =>
                  /^sign in$/i.test(part) ? (
                    <Text
                      key={index}
                      style={{
                        fontWeight: '600',
                        textDecorationLine: 'underline',
                      }}
                      onPress={() => router.push('/sign-in')}
                    >
                      {part}
                    </Text>
                  ) : (
                    part
                  ),
                )}
              </Text>
              <TouchableOpacity onPress={clearError}>
                <Ionicons name="close" size={20} color={'#9A8478'} />
              </TouchableOpacity>
            </View>
          ) : null}

          {pendingVerification ? (
            <>
              <TextInput
                style={[authStyles.input, compact && authCompactStyles.input]}
                value={code}
                placeholder="Enter verification code"
                keyboardType="numeric"
                onChangeText={(value: string) => {
                  setCode(value);
                  if (error) clearError();
                }}
                returnKeyType="done"
                onSubmitEditing={onVerifyPress}
              />

              <TouchableOpacity
                style={[
                  styles.button,
                  compact && authCompactStyles.button,
                  isSubmitting && { opacity: 0.6 },
                ]}
                onPress={onVerifyPress}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Verifying...' : 'Verify'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={[authStyles.input, compact && authCompactStyles.input]}
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
                onSubmitEditing={onSignUpPress}
                textContentType="newPassword"
                autoComplete="password-new"
                compact={compact}
              />

              <LegalConsentCheckbox
                value={termsAccepted}
                onValueChange={(next) => {
                  setTermsAccepted(next);
                  if (error) clearError();
                }}
              />

              <TouchableOpacity
                style={[
                  styles.button,
                  compact && authCompactStyles.button,
                  (isSubmitting || !termsAccepted) && { opacity: 0.6 },
                ]}
                onPress={onSignUpPress}
                disabled={isSubmitting || !termsAccepted}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Creating...' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={authStyles.footerContainer}>
            <Text style={authStyles.footerText}>Already have an account?</Text>

            <Link href="/sign-in" asChild>
              <TouchableOpacity>
                <Text style={{ fontWeight: '600', fontSize: 16 }}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}
