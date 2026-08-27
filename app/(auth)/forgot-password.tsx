import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authStyles } from '../../src/assets/styles/auth.styles';
import { styles } from '../../src/assets/styles/styles';
import { useAuthLayout } from '@/src/features/auth/hooks/useAuthLayout';
import { useResetPassword } from '@/src/features/auth/hooks/useResetPassword';
import PasswordInput from '@/src/components/PasswordInput';
import { Fonts } from '@/src/constants/typography';

export default function ForgotPasswordScreen() {
  const [emailAddress, setEmailAddress] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [pendingReset, setPendingReset] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const layout = useAuthLayout();

  const { onRequestResetPress, onResetPasswordPress } = useResetPassword({
    emailAddress,
    code,
    password,
    pendingReset,
    setPendingReset,
    isSubmitting,
    setIsSubmitting,
    setError,
  });

  const clearError = () => setError('');

  return (
    <>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 + insets.top }}>
        <TouchableOpacity
          onPress={() => router.replace('/sign-in')}
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
        <View style={layout.container}>
          <Text style={layout.title}>Reset password</Text>

          <View style={layout.subtitle}>
            {pendingReset ? (
              <>
                <Text style={layout.subtitleText}>
                  We sent a code to your email.
                </Text>
                <Text style={layout.subtitleText}>
                  Enter it below with your new password.
                </Text>
              </>
            ) : (
              <>
                <Text style={layout.subtitleText}>Forgot your password?</Text>
                <Text style={layout.subtitleText}>
                  Enter your email to receive a reset code.
                </Text>
              </>
            )}
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

          {pendingReset ? (
            <>
              <TextInput
                style={layout.input}
                value={code}
                placeholder="Enter reset code"
                keyboardType="numeric"
                onChangeText={(value: string) => {
                  setCode(value);
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
                onSubmitEditing={onResetPasswordPress}
                textContentType="newPassword"
                autoComplete="password-new"
                placeholder="Enter new password"
                compact={layout.compact}
              />

              <TouchableOpacity
                style={[layout.button, isSubmitting && { opacity: 0.6 }]}
                onPress={onResetPasswordPress}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Resetting...' : 'Reset password'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={layout.input}
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
                returnKeyType="done"
                onSubmitEditing={onRequestResetPress}
              />

              <TouchableOpacity
                style={[layout.button, isSubmitting && { opacity: 0.6 }]}
                onPress={onRequestResetPress}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>
                  {isSubmitting ? 'Sending...' : 'Send reset code'}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={authStyles.footerContainer}>
            <Text style={authStyles.footerText}>Remembered it?</Text>

            <TouchableOpacity onPress={() => router.replace('/sign-in')}>
              <Text
                style={{
                  fontFamily: Fonts.body.semibold,
                  fontWeight: '600',
                  fontSize: 16,
                }}
              >
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </>
  );
}
