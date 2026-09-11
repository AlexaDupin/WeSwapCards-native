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
const PRODUCTION_API_URL: string | null = 'https://api.weswapcards.com/api/v1';

const EAS_PROJECT_ID = 'b7e77286-6197-49e0-92f0-05491baf7f5d';

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

  // eas-cli resolves this config more than once. The first pass is a bootstrap:
  // it reads the config to learn the EAS project id, before it can fetch that
  // project's environment, so it runs with EXPO_NO_DOTENV set and no values at
  // all. Throwing there kills the bootstrap and eas-cli never reaches the pass
  // that does inject them, which failed every production build before it
  // started. So absent values mean "not the pass that can be checked", not
  // "misconfigured". Enforcement still happens: on the worker EAS_BUILD is set,
  // and on the injected pass the values are present, so a wrong backend or a
  // test Clerk key cannot ship either way.
  const hasValues = Boolean(baseUrl && clerkKey);
  const mustBeComplete =
    process.env.EAS_BUILD === 'true' || (env === 'production' && hasValues);
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
  updates: {
    url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
  },
  // fingerprint, not eas-cli's appVersion default: `version` stays 1.0.0 across
  // many builds (autoIncrement moves the build number, not this), so appVersion
  // would let an update built against new native code reach a build without it.
  runtimeVersion: {
    policy: 'fingerprint',
  },
  ios: {
    bundleIdentifier: 'com.weswapcards.app',
    // The UI is portrait and phone-shaped, and has never been run on iPad.
    // Supporting iPad would also require a 13" iPad screenshot set.
    supportsTablet: false,
    // Always the navy (dark) icon, in every appearance. The appearance-aware
    // pair put the white variant on light-mode home screens, which is not the
    // brand mark we want to ship.
    icon: './src/assets/images/brand/icon-dark.png',
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
      projectId: EAS_PROJECT_ID,
    },
  },
  owner: 'alexdl7',
};

export default config;
