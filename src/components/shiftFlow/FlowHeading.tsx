import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { toneColor, type Tone } from '@/theme/tone';

/** Coloured overline + bold title + muted subtitle used across the Live shift (10) frames. */
export const FlowHeading: FC<{
  overline?: string;
  tone?: Tone;
  title: string;
  subtitle?: string;
  /** Request screens: 11px overline, 23px title. */
  isLarge?: boolean;
}> = ({ overline, tone = 'primary', title, subtitle, isLarge }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, isLarge && styles.rootLarge]}>
      {overline ? (
        <Text
          style={[
            styles.overline,
            isLarge && styles.overlineLarge,
            { color: toneColor(colors, tone) },
          ]}
        >
          {overline}
        </Text>
      ) : null}
      <Text
        accessibilityRole="header"
        style={[
          styles.title,
          isLarge && styles.titleLarge,
          { color: colors.text },
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: 6 },
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
  rootLarge: { marginTop: 6 },
  overlineLarge: { fontSize: 11, lineHeight: 15.4 },
  title: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 28 },
  titleLarge: { fontSize: 23, lineHeight: 29 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
});
