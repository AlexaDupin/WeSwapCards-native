// Locking the activity to portrait makes Google Play infer a required
// android.hardware.screen.portrait feature, which blocks installs on tablets,
// desktops and XR devices and stops the release from being sent for review.
// Declaring the feature as optional keeps portrait mode but lifts that block.
const { withAndroidManifest } = require('expo/config-plugins');

const FEATURE = 'android.hardware.screen.portrait';

module.exports = function withOptionalPortraitFeature(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    const features = manifest['uses-feature'] ?? [];
    const existing = features.find((f) => f.$['android:name'] === FEATURE);

    if (existing) {
      existing.$['android:required'] = 'false';
    } else {
      features.push({
        $: { 'android:name': FEATURE, 'android:required': 'false' },
      });
    }

    manifest['uses-feature'] = features;
    return mod;
  });
};
