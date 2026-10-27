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
  /** Overline as a soft rounded badge (web `.worker-scheduled-shift-application-status`). */
  isPill?: boolean;
  /** Uppercase overline (web `.section-label`). */
  isCaps?: boolean;
}> = ({ overline, tone = 'primary', title, subtitle, isLarge, isPill, isCaps }) => {
  const { colors } = useTheme();
  const pillBg = {
    default: colors.fill,
    primary: colors.primarySoft,
    success: colors.successSoft,
    warning: colors.fill,
    danger: colors.dangerSoft,
  }[tone];
  return (
    <View style={[styles.root, isLarge && styles.rootLarge]}>
      {overline ? (
        <Text
          style={[
            styles.overline,
            isLarge && styles.overlineLarge,
            isPill && [styles.pill, { backgroundColor: pillBg }],
            isCaps && styles.caps,
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
  caps: { fontSize: 11, lineHeight: 15, letterSpacing: 0.66, textTransform: 'uppercase' },
  rootLarge: { marginTop: 6 },
  overlineLarge: { fontSize: 11, lineHeight: 15.4 },
  pill: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
  },
  title: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 28 },
  titleLarge: { fontSize: 23, lineHeight: 29 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
});
