import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { SplashLogo } from './components';
import { SPLASH_STRINGS } from './constants';
import { useSplashRedirect } from './hooks/useSplashRedirect';

/**
 * Splash page orchestrator. Figma: Splash · Light (1:10) / Splash · Dark (1:23).
 * - ui: components/ (SplashLogo)
 * - constants: constants/splashStrings.ts
 * - behaviour: hooks/useSplashRedirect.ts (replaces with Welcome)
 */
export const SplashPage: FC = () => {
  const { colors } = useTheme();
  useSplashRedirect();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID="splash-page">
      <SplashLogo />
      <Text style={[styles.title, { color: colors.text }]}>{SPLASH_STRINGS.BRAND_TITLE}</Text>
      <Text style={[styles.tagline, { color: colors.textMuted }]}>{SPLASH_STRINGS.TAGLINE}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Content block sits 30px above vertical centre in the 390x872 frame.
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  title: { marginTop: 30, fontFamily: FONTS.bold, fontSize: 30, textAlign: 'center' },
  tagline: { marginTop: 9, width: 350, fontFamily: FONTS.regular, fontSize: 14, textAlign: 'center' },
});
