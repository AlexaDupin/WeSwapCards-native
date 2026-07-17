import axios from 'axios';

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

export { axiosInstance };
