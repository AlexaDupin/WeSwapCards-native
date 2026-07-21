import axios from 'axios';

import { notifyUnauthorized } from '@/src/lib/apiAuthEvents';

const baseURL = process.env.EXPO_PUBLIC_BASE_URL;

// EXPO_PUBLIC_* values are inlined at build time; a build made without this
// variable would ship with every request silently hitting a relative URL.
// Crash immediately instead so the broken build can never reach a store.
if (!baseURL) {
  throw new Error(
    'EXPO_PUBLIC_BASE_URL is not set. Define it in .env (local dev) or in the EAS environment for this build profile.',
  );
}

const axiosInstance = axios.create({ baseURL });

// A 401 means the API rejected the session token server-side, even though the
// Clerk client may still believe it's signed in (the mismatch that let the
// production auth outage stay invisible). Notify the app so it can sign out and
// fall back to the sign-in guard. The error is still rejected so per-screen
// catch blocks continue to run.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      notifyUnauthorized();
    }
    return Promise.reject(error);
  },
);

export { axiosInstance };
