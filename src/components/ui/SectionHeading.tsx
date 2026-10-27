import { useEffect, useRef, type FC } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const BlinkDot: FC<{ color: string }> = ({ color }) => {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View style={[styles.dot, { backgroundColor: color, opacity }]} />
  );
};

/** Figma "Section heading" (1:1499): 18px title + 12px primary action. */
export const SectionHeading: FC<{
  title: string;
  action?: string;
  onAction?: () => void;
  /** Status-coloured section title (web `.business-shift-section h2`). */
  statusColor?: string;
  /** Blinking red dot before the title (web `.live-blink-dot`). */
  isLive?: boolean;
}> = ({ title, action, onAction, statusColor, isLive = false }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <View style={styles.titleRow}>
        {isLive ? <BlinkDot color={colors.danger} /> : null}
        <Text
          accessibilityRole="header"
          style={
            statusColor
              ? [styles.statusTitle, { color: statusColor }]
              : [styles.title, { color: colors.text }]
          }
        >
          {title}
        </Text>
      </View>
      {action ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={onAction}>
          <Text style={[styles.action, { color: colors.primary }]}>
            {action}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { fontFamily: FONTS.regular, fontSize: 18, lineHeight: 26 },
  statusTitle: { fontFamily: FONTS.bold, fontSize: 16, lineHeight: 24 },
  action: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 18 },
});
