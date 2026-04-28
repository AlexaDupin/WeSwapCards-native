import { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';

import PageLoader from '@/src/components/PageLoader';
import { axiosInstance } from '@/src/lib/axiosInstance';
import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import { authStyles } from '@/src/assets/styles/auth.styles';
import { styles } from '@/src/assets/styles/styles';

const USERNAME_PATTERN = /^[a-zA-Z0-9_.]{2,20}$/;

export default function RegisterUserScreen() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { setExplorer } = useExplorer();

  const [checkingUser, setCheckingUser] = useState(true);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /**
   -------------------------------------------------
   STEP 1 — Check if explorer already exists
   -------------------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    async function checkExplorer() {
      if (!isLoaded || !user?.id) return;

      try {
        const token = await getToken();
        if (!token) return;

        const resp = await axiosInstance.post(
          '/login/user',
          { userUID: user.id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const explorer = resp.data;

        // Explorer already exists → skip this screen
        if (!cancelled && explorer?.id) {
          setExplorer({
            explorerId: explorer.id,
            explorerName: explorer.name ?? null,
          });

          router.replace('/(tabs)/cards');
        }
      } catch {
        // Ignore → user likely not created yet
      } finally {
        if (!cancelled) setCheckingUser(false);
      }
    }

    checkExplorer();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, user?.id, getToken, router, setExplorer]);

  /**
   -------------------------------------------------
   STEP 2 — Create explorer
   -------------------------------------------------
   */
  const handleCreateUser = useCallback(async () => {
    setError('');

    const trimmed = username.trim();

    if (!trimmed) {
      setError('Please choose a username.');
      return;
    }

    if (trimmed.length < 2) {
      setError('Your username must contain at least 2 characters.');
      return;
    }

    if (trimmed.length > 20) {
      setError('Your username must contain 20 characters max.');
      return;
    }

    if (!USERNAME_PATTERN.test(trimmed)) {
      setError(
        'The format is invalid. Your username must contain between 2 and 20 letters and/or numbers, underscores, or full stops.',
      );
      return;
    }

    if (!user?.id) {
      setError('User session missing. Please sign in again.');
      return;
    }

    setSubmitting(true);

    try {
      const token = await getToken();

      await axiosInstance.post(
        '/register/user',
        {
          userUID: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress ?? '',
          sanitizedUsername: trimmed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      /**
       Fetch explorer again to get the ID
       (safer than trusting response shape)
       */
      const loginResp = await axiosInstance.post(
        '/login/user',
        { userUID: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const explorer = loginResp.data;

      if (!explorer?.id) {
        setError('Account created but failed to load profile.');
        return;
      }

      setExplorer({
        explorerId: explorer.id,
        explorerName: explorer.name ?? null,
      });

      router.replace('/(tabs)/cards');
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || 'Registration failed.';

      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [
    username,
    user?.id,
    user?.primaryEmailAddress?.emailAddress,
    getToken,
    router,
    setExplorer,
  ]);

  /**
   -------------------------------------------------
   LOADING STATE
   -------------------------------------------------
   */
  if (checkingUser) {
    return <PageLoader />;
  }

  /**
   -------------------------------------------------
   UI
   -------------------------------------------------
   */
  return (
    <>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <TouchableOpacity
          onPress={() => router.replace('/')}
          style={{ alignSelf: 'flex-start', padding: 8 }}
          hitSlop={10}
        >
          <Ionicons name="close" size={22} />
        </TouchableOpacity>
      </View>

      <View style={authStyles.container}>
        <Text style={authStyles.title}>Choose a username</Text>

        <View style={authStyles.subtitle}>
          <Text style={authStyles.subtitleText}>
            One last step to finish creating your account.
          </Text>
          <Text style={authStyles.subtitleText}>
            Use your WeWard username to make things easier.
          </Text>
        </View>

        {error ? (
          <View style={authStyles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={'#E74C3C'} />
            <Text style={authStyles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError('')}>
              <Ionicons name="close" size={20} color={'#9A8478'} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={authStyles.input}
          placeholder="Enter a username"
          autoCapitalize="none"
          autoCorrect={false}
          value={username}
          onChangeText={(value: string) => {
            setUsername(value);
            if (error) setError('');
          }}
          returnKeyType="done"
          onSubmitEditing={handleCreateUser}
        />

        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.6 }]}
          onPress={handleCreateUser}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? 'Creating...' : 'Create account'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
