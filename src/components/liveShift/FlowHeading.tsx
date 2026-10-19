import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Coloured overline + bold title + muted subtitle used across the Live shift (10) frames. */
export const FlowHeading: FC<{
  overline?: string;
  tone?: 'primary' | 'success';
  title: string;
  subtitle?: string;
}> = ({ overline, tone = 'primary', title, subtitle }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      {overline ? (
        <Text
          style={[
            styles.overline,
            { color: tone === 'success' ? colors.success : colors.primary },
          ]}
        >
          {overline}
        </Text>
      ) : null}
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text }]}
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
  title: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 28 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
});
