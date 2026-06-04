import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

import { useExplorer } from '@/src/features/auth/context/ExplorerContext';
import {
  registerPushToken,
  deletePushToken,
} from '@/src/features/notifications/api/notificationsApi';
import {
  ensureAndroidChannel,
  ensurePermission,
  getDevicePushToken,
  currentPlatform,
  type PermissionResult,
} from '@/src/features/notifications/device';

const ENABLED_KEY = 'notif.messagesEnabled';
const TOKEN_KEY = 'notif.lastPushToken';

// Show new-message notifications even while the app is foregrounded. No badge,
// consistent with the v1 decision to defer badge counts.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Open the conversation referenced by a tapped notification's data payload.
function openConversationFromResponse(
  response: Notifications.NotificationResponse | null,
) {
  const conversationId =
    response?.notification?.request?.content?.data?.conversationId;
  if (conversationId == null) return;
  router.push({
    pathname: '/(modal)/chat/[conversationId]',
    params: { conversationId: String(conversationId) },
  });
}

type NotificationsState = {
  // App-level opt-in (distinct from the OS permission below). null while loading.
  enabled: boolean | null;
  // Last known OS permission outcome.
  permission: PermissionResult | 'unknown';
  setEnabled: (next: boolean) => Promise<void>;
  openSystemSettings: () => void;
};

const NotificationsContext = createContext<NotificationsState | null>(null);

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken, isSignedIn } = useAuth();
  const { explorerId, status } = useExplorer();

  const [enabled, setEnabledState] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<PermissionResult | 'unknown'>(
    'unknown',
  );

  const getTokenRef = useRef(getToken);
  useEffect(() => {
    getTokenRef.current = getToken;
  }, [getToken]);

  // Avoid re-registering repeatedly for the same explorer in one session.
  const registeredForRef = useRef<number | null>(null);
  const lastTokenRef = useRef<string | null>(null);

  const authHeaders = useCallback(async () => {
    const t = await getTokenRef.current();
    return { Authorization: `Bearer ${t}` };
  }, []);

  // Load the persisted opt-in (default ON) once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await SecureStore.getItemAsync(ENABLED_KEY).catch(
        () => null,
      );
      if (cancelled) return;
      setEnabledState(stored == null ? true : stored === 'true');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(async () => {
    const perm = await ensurePermission();
    setPermission(perm);
    if (perm !== 'granted') return;

    await ensureAndroidChannel();

    const token = await getDevicePushToken();
    if (!token) return;

    const headers = await authHeaders();
    await registerPushToken({ token, platform: currentPlatform(), headers });

    lastTokenRef.current = token;
    await SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {});
  }, [authHeaders]);

  const unregister = useCallback(async () => {
    const token =
      lastTokenRef.current ??
      (await SecureStore.getItemAsync(TOKEN_KEY).catch(() => null));
    if (!token) return;

    try {
      const headers = await authHeaders();
      await deletePushToken({ token, headers });
    } catch {
      // best-effort; server also disables dead tokens on send
    }
    lastTokenRef.current = null;
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  }, [authHeaders]);

  // Auto-register once the explorer is ready and the user is opted in.
  useEffect(() => {
    if (!isSignedIn) {
      registeredForRef.current = null;
      return;
    }
    if (enabled !== true) return;
    if (status !== 'ready' || explorerId == null) return;
    if (registeredForRef.current === explorerId) return;

    registeredForRef.current = explorerId;
    register().catch(() => {
      // allow a retry on a later render if it failed
      registeredForRef.current = null;
    });
  }, [isSignedIn, enabled, status, explorerId, register]);

  const setEnabled = useCallback(
    async (next: boolean) => {
      setEnabledState(next);
      await SecureStore.setItemAsync(ENABLED_KEY, String(next)).catch(() => {});

      if (next) {
        registeredForRef.current = explorerId ?? null;
        await register().catch(() => {
          registeredForRef.current = null;
        });
      } else {
        registeredForRef.current = null;
        await unregister();
      }
    },
    [explorerId, register, unregister],
  );

  // Navigate to the conversation when a notification is tapped — both while the
  // app is running and from a cold start (getLastNotificationResponseAsync).
  useEffect(() => {
    let mounted = true;
    Notifications.getLastNotificationResponseAsync()
      .then((resp) => {
        if (mounted) openConversationFromResponse(resp);
      })
      .catch(() => {});

    const sub = Notifications.addNotificationResponseReceivedListener(
      openConversationFromResponse,
    );
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const openSystemSettings = useCallback(() => {
    Linking.openSettings().catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ enabled, permission, setEnabled, openSystemSettings }),
    [enabled, permission, setEnabled, openSystemSettings],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
}
