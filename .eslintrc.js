module.exports = {
  root: true,
  extends: '@react-native',
  // Generated or vendored code: leaflet bundle from scripts/generate-leaflet-source.mjs,
  // CocoaPods and native build output.
  ignorePatterns: [
    'src/assets/leaflet/leafletSource.ts',
    'ios/Pods/',
    'ios/build/',
    'android/build/',
    'android/app/build/',
    'coverage/',
  ],
};
