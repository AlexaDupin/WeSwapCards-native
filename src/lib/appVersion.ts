import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

// "1.0.0 (a1b2c3d)" or "1.0.0 (embedded)".
//
// The suffix identifies which JS bundle is actually running, which the app
// version alone cannot: an OTA update changes the bundle without changing the
// version. It makes a bug report answerable — "what does the bottom of your
// account menu say?" beats inferring from symptoms whether someone received a
// fix.
export function appVersionLabel(): string {
  const version = Constants.expoConfig?.version ?? '?';

  // updateId is null until an OTA update has been applied, so a fresh install
  // running the bundle shipped inside the binary reads as "embedded".
  const updateId = Updates.updateId;
  const build = updateId ? updateId.replace(/-/g, '').slice(0, 7) : 'embedded';

  return `${version} (${build})`;
}
