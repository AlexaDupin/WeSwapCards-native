import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { getProjectId } from './projectId';

export const MESSAGES_CHANNEL_ID = 'default';

// Android requires a channel (8+) for heads-up notifications to display.
export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(MESSAGES_CHANNEL_ID, {
    name: 'Messages',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#2563eb',
  });
}

export type PermissionResult = 'granted' | 'denied' | 'blocked';

// Returns 'granted' if usable, 'blocked' if the OS won't let us ask again
// (the user must enable it in system Settings), 'denied' otherwise.
export async function ensurePermission(): Promise<PermissionResult> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return 'granted';
  if (!current.canAskAgain) return 'blocked';

  const req = await Notifications.requestPermissionsAsync();
  if (req.granted) return 'granted';
  return req.canAskAgain ? 'denied' : 'blocked';
}

// Fetch the Expo push token for this device. Returns null on failure (e.g.
// missing projectId, or running where a token can't be obtained).
export async function getDevicePushToken(): Promise<string | null> {
  const projectId = getProjectId();
  try {
    const res = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return res.data ?? null;
  } catch {
    return null;
  }
}

export function currentPlatform(): 'ios' | 'android' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}
