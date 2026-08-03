import type { ExpoConfig } from 'expo/config';

// This file replaces app.json so that the build configuration can be validated
// before a binary is produced. EAS evaluates it at build time, so a production
// build made against the wrong backend or the wrong Clerk instance fails here
// rather than shipping an app that silently talks to the test stack.

type AppEnv = 'development' | 'preview' | 'production';

// The full base URL the production build must point at, path included. Two
// builds can share a host and still differ in the API path that actually works.
// Set this before the first production build; until then a production build
// fails the check below rather than accepting whatever it is handed.
const PRODUCTION_API_URL: string | null = null;

function fail(message: string): never {
  throw new Error(`[app.config] ${message}`);
}

// Compares base URLs by their parsed form so that a trailing slash or a
// differing case in the host doesn't read as a mismatch, and requires HTTPS.
function normalizeUrl(value: string, label: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return fail(`${label} is not a valid URL: "${value}".`);
  }

  if (url.protocol !== 'https:') {
    fail(`${label} must use HTTPS: "${value}".`);
  }

  return url.toString().replace(/\/$/, '');
}

// Reads APP_ENV rather than inferring the environment from __DEV__: a preview
// build is also a non-development build, but it legitimately runs against the
// test stack with a pk_test key.
//
// APP_ENV is deliberately not EXPO_PUBLIC_-prefixed. It classifies the build for
// this config only; nothing in the app reads it at runtime, so there is no
// reason to inline it into the client bundle.
function appEnv(): AppEnv {
  const value = process.env.APP_ENV;

  if (!value) {
    // A cloud build must never guess. Without this, a profile missing its
    // environment binding would quietly build as "development" and skip every
    // production check below.
    if (process.env.EAS_BUILD === 'true' || process.env.CI === '1') {
      fail('APP_ENV must be set explicitly for EAS and CI builds.');
    }
    return 'development';
  }

  if (
    value === 'development' ||
    value === 'preview' ||
    value === 'production'
  ) {
    return value;
  }

  return fail(
    `APP_ENV must be development, preview, or production (got "${value}").`,
  );
}

function validateEnvironment(): void {
  const env = appEnv();
  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL;
  const clerkKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // eas-cli resolves this config for commands like `env:list`, with no .env
  // loaded and only the selected environment's variables injected. Missing
  // values are not an error there. Only a real build, or a configuration
  // claiming to be production, has to have them in hand. A local run without
  // .env is still caught at runtime by src/lib/axiosInstance.ts.
  const mustBeComplete =
    process.env.EAS_BUILD === 'true' || env === 'production';
  if (!mustBeComplete) return;

  if (!baseUrl) fail('EXPO_PUBLIC_BASE_URL is not set.');
  if (!clerkKey) fail('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not set.');

  if (env !== 'production') return;

  if (!clerkKey.startsWith('pk_live_')) {
    fail(
      'A production build requires a live Clerk key (pk_live_…). The ' +
        'configured key belongs to a development instance.',
    );
  }

  if (PRODUCTION_API_URL === null) {
    fail(
      'PRODUCTION_API_URL is not set in app.config.ts. Set it to the o2switch ' +
        'API base URL before building for production.',
    );
  }

  const configured = normalizeUrl(baseUrl, 'EXPO_PUBLIC_BASE_URL');
  const expected = normalizeUrl(PRODUCTION_API_URL, 'PRODUCTION_API_URL');

  if (configured !== expected) {
    fail(
      `EXPO_PUBLIC_BASE_URL is "${configured}" but production expects ` +
        `"${expected}".`,
    );
  }
}

validateEnvironment();

const config: ExpoConfig = {
  name: 'WeSwapCards',
  slug: 'weswapcards-native',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/images/brand/icon-dark.png',
  scheme: 'weswapcardsnative',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  ios: {
    bundleIdentifier: 'com.weswapcards.app',
    // The UI is portrait and phone-shaped, and has never been run on iPad.
    // Supporting iPad would also require a 13" iPad screenshot set.
    supportsTablet: false,
    icon: {
      light: './src/assets/images/brand/icon-light.png',
      dark: './src/assets/images/brand/icon-dark.png',
    },
    config: {
      // Predeclares that the app uses no non-exempt encryption, so the export
      // compliance question doesn't have to be answered for each upload.
      usesNonExemptEncryption: false,
    },
  },
  android: {
    package: 'com.weswapcards.app',
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      foregroundImage: './src/assets/images/brand/adaptive-icon.png',
      monochromeImage: './src/assets/images/brand/adaptive-icon-monochrome.png',
      backgroundColor: '#021133',
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './src/assets/images/brand/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './src/assets/images/brand/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    'expo-font',
    [
      'expo-notifications',
      {
        icon: './src/assets/images/brand/notification-icon.png',
        color: '#F07A1A',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: 'b7e77286-6197-49e0-92f0-05491baf7f5d',
    },
  },
  owner: 'alexdl7',
};

export default config;
