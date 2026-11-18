// Keeps files that cannot affect native code out of the EAS Update fingerprint.
// Each of these has changed the runtime version without a native change and cut
// the Play build off from OTA updates: a .gitignore edit (deb0eac) and adding
// package.json scripts. ExpoConfigVersions keeps a store version bump (needed
// for every new App Store upload) from changing the runtime of the other platform.
/** @type {import('expo/fingerprint').Config} */
const config = {
  sourceSkips: ['GitIgnore', 'PackageJsonScriptsAll', 'ExpoConfigVersions'],
};

module.exports = config;
