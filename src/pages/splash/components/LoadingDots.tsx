import type { FC } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

/** Three pulsing brand dots at the bottom of the splash. */
export const LoadingDots: FC<{ dots: Animated.Value[]; bottom: number }> = ({
  dots,
  bottom,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { bottom }]} pointerEvents="none">
      {dots.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: colors.primary,
              opacity: v.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  scale: v.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.35],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
