import { useEffect, useState, type FC, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { MOTION } from '@/constants/motion';

type MotionProps = {
  delay?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Plays once on mount; jumps straight to the end when Reduce Motion is on. */
const useEntrance = (
  delay: number,
  duration: number,
  easing: (t: number) => number,
) => {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then(reduce => {
      if (cancelled) {
        return;
      }
      if (reduce) {
        progress.setValue(1);
        return;
      }
      Animated.timing(progress, {
        toValue: 1,
        duration,
        delay,
        easing,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      cancelled = true;
      progress.stopAnimation();
    };
  }, [progress, delay, duration, easing]);

  return progress;
};

/** Fade in while rising 14px — the splash "word"/"tag" motion. */
export const Rise: FC<MotionProps> = ({ delay = 0, children, style }) => {
  const progress = useEntrance(delay, MOTION.riseDuration, MOTION.out);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [MOTION.riseDistance, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

/** Scale up from 0.5 with a slight un-tilt — the splash logo-tile motion. */
export const PopIn: FC<MotionProps> = ({ delay = 0, children, style }) => {
  const progress = useEntrance(delay, MOTION.popDuration, MOTION.spring);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress.interpolate({
            inputRange: [0, 0.4, 1],
            outputRange: [0, 1, 1],
          }),
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
            {
              rotate: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ['-10deg', '0deg'],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
