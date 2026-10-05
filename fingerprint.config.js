// Keeps files that cannot affect native code out of the EAS Update fingerprint.
// Each of these has changed the runtime version without a native change and cut
// the Play build off from OTA updates: a .gitignore edit (deb0eac) and adding
// package.json scripts.
/** @type {import('expo/fingerprint').Config} */
const config = {
  sourceSkips: ['GitIgnore', 'PackageJsonScriptsAll'],
};

module.exports = config;
