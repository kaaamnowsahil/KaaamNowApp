import { useEffect, useState, type FC } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { BrandLogo } from './BrandLogo';

const LOADING = 'Loading…';

/**
 * Brand loader: the KaaamNow logo (same as Splash) pulsing inside a spinning
 * ring. Fills its parent and centres itself.
 */
export const Loader: FC<{ label?: string }> = ({ label = LOADING }) => {
  const { colors } = useTheme();
  const [spin] = useState(() => new Animated.Value(0));
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let loops: Animated.CompositeAnimation[] = [];
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then(reduce => {
      if (cancelled || reduce) {
        return;
      }
      loops = [
        Animated.loop(
          Animated.timing(spin, {
            toValue: 1,
            duration: 900,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulse, {
              toValue: 1,
              duration: 450,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pulse, {
              toValue: 0,
              duration: 450,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ),
      ];
      loops.forEach(loop => loop.start());
    });
    return () => {
      cancelled = true;
      loops.forEach(loop => loop.stop());
    };
  }, [spin, pulse]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={styles.root}
      testID="loader"
    >
      <View style={styles.badge}>
        <Animated.View
          style={[
            styles.ring,
            {
              borderColor: colors.primarySoft,
              borderTopColor: colors.primary,
              transform: [
                {
                  rotate: spin.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.tile,
            {
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.92, 1.04],
                  }),
                },
              ],
            },
          ]}
        >
          <BrandLogo size={46} />
        </Animated.View>
      </View>
      <Text style={[styles.label, { color: colors.textSubtle }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: 56,
  },
  badge: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
  },
  tile: { alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
});
