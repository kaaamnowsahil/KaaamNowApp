import type { FC } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { AnimatedLogo, LoadingDots } from './components';
import { SPLASH_STRINGS } from './constants';
import { useSplashAnimation } from './hooks/useSplashAnimation';

/** Total length of the intro before route/route.tsx leaves the splash (ms). */
export const SPLASH_DURATION_MS = 2600;

const rise = (value: Animated.Value) => ({
  opacity: value,
  transform: [
    {
      translateY: value.interpolate({
        inputRange: [0, 1],
        outputRange: [14, 0],
      }),
    },
  ],
});

/**
 * Splash page orchestrator. Figma: Splash · Light (1:10) / Dark (1:23),
 * animated per "KaaamNow Splash Motion".
 * - motion: hooks/useSplashAnimation.ts
 * - ui: components/ (AnimatedLogo, LoadingDots)
 */
export const SplashPage: FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const motion = useSplashAnimation();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      testID="splash-page"
    >
      <AnimatedLogo
        tile={motion.tile}
        ring={motion.ring}
        float={motion.float}
        glow={motion.glow}
        pieces={motion.pieces}
      />
      <Animated.Text
        style={[styles.title, { color: colors.text }, rise(motion.word)]}
      >
        {SPLASH_STRINGS.BRAND_TITLE}
      </Animated.Text>
      <Animated.Text
        style={[styles.tagline, { color: colors.textMuted }, rise(motion.tag)]}
      >
        {SPLASH_STRINGS.TAGLINE}
      </Animated.Text>
      <LoadingDots dots={motion.dots} bottom={26 + insets.bottom} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  title: {
    marginTop: 30,
    fontFamily: FONTS.bold,
    fontSize: 30,
    textAlign: 'center',
  },
  tagline: {
    marginTop: 9,
    width: 350,
    fontFamily: FONTS.regular,
    fontSize: 14,
    textAlign: 'center',
  },
});
