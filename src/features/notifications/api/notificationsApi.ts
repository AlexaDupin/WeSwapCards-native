import { axiosInstance } from '@/src/lib/axiosInstance';

type AuthHeaders = Record<string, string>;
export type PushPlatform = 'ios' | 'android';

// Register (or re-activate) this device's Expo push token. The backend derives
// the explorer from the Clerk session — we only send the token + platform.
export async function registerPushToken(args: {
  token: string;
  platform: PushPlatform;
  headers: AuthHeaders;
}) {
  const { token, platform, headers } = args;
  await axiosInstance.post(
    '/push-tokens',
    { token, platform },
    { headers, timeout: 10000 },
  );
}

// Disable this device's token (logout / in-app opt-out). axios sends a DELETE
// body via `data`.
export async function deletePushToken(args: {
  token: string;
  headers: AuthHeaders;
}) {
  const { token, headers } = args;
  await axiosInstance.delete('/push-tokens', {
    data: { token },
    headers,
    timeout: 10000,
  });
}
