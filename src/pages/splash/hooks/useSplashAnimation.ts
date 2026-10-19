import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

import { MOTION } from '@/constants/motion';

/** Timings from "KaamNow Splash Motion" (ms). */
const SPRING = MOTION.spring;
const OUT = MOTION.out;
export const PIECE_DELAYS = [300, 450, 550, 650, 730, 810];
const DOT_DELAYS = [1600, 1800, 2000];

const useAnimatedValue = (initial: number) =>
  useState(() => new Animated.Value(initial))[0];

const timing = (
  value: Animated.Value,
  duration: number,
  delay: number,
  easing: (t: number) => number,
  useNativeDriver = true,
) =>
  Animated.timing(value, {
    toValue: 1,
    duration,
    delay,
    easing,
    useNativeDriver,
  });

export const useSplashAnimation = () => {
  const tile = useAnimatedValue(0);
  const ring = useAnimatedValue(0);
  const word = useAnimatedValue(0);
  const tag = useAnimatedValue(0);
  const float = useAnimatedValue(0);
  const glow = useAnimatedValue(0);
  const [pieces] = useState(() =>
    PIECE_DELAYS.map(() => new Animated.Value(0)),
  );
  const [dots] = useState(() => DOT_DELAYS.map(() => new Animated.Value(0)));

  useEffect(() => {
    let cancelled = false;
    const all = [tile, ring, word, tag, ...pieces];

    const run = (reduceMotion: boolean) => {
      if (cancelled) {
        return;
      }
      if (reduceMotion) {
        all.forEach(v => v.setValue(1));
        ring.setValue(0);
        return;
      }
      Animated.parallel([
        timing(tile, 750, 0, SPRING),
        // SVG pieces animate scale/opacity props, which the native driver can't drive.
        ...pieces.map((v, i) => timing(v, 550, PIECE_DELAYS[i], SPRING, false)),
        timing(ring, 1200, 800, OUT),
        timing(word, 700, 1050, OUT),
        timing(tag, 700, 1200, OUT),
      ]).start();

      dots.forEach((v, i) =>
        Animated.sequence([
          Animated.delay(DOT_DELAYS[i]),
          Animated.loop(
            Animated.sequence([
              Animated.timing(v, {
                toValue: 1,
                duration: 600,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(v, {
                toValue: 0,
                duration: 600,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ),
        ]).start(),
      );

      const pulse = (
        value: Animated.Value,
        duration: number,
        useNativeDriver: boolean,
      ) =>
        Animated.sequence([
          Animated.delay(2000),
          Animated.loop(
            Animated.sequence([
              Animated.timing(value, {
                toValue: 1,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver,
              }),
              Animated.timing(value, {
                toValue: 0,
                duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver,
              }),
            ]),
          ),
        ]).start();
      pulse(float, 4000, true);
      pulse(glow, 3200, false);
    };

    AccessibilityInfo.isReduceMotionEnabled().then(run);

    return () => {
      cancelled = true;
      [...all, ...dots, float, glow].forEach(v => v.stopAnimation());
    };
  }, [tile, ring, word, tag, float, glow, pieces, dots]);

  return { tile, ring, word, tag, float, glow, pieces, dots };
};
