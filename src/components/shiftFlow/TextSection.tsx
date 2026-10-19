import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Heading + paragraph on shift details.
 * - lead: "What you'll do" (17 / 14)
 * - note: "Before you accept" (17 / 12)
 * - fine: "Cancellation policy" (12 semibold / 11)
 */
export const TextSection: FC<{
  title: string;
  body: string;
  variant?: 'lead' | 'note' | 'fine';
}> = ({ title, body, variant = 'lead' }) => {
  const { colors } = useTheme();
  const isFine = variant === 'fine';
  return (
    <View style={isFine ? styles.fineRoot : styles.root}>
      <Text
        accessibilityRole="header"
        style={[isFine ? styles.fineTitle : styles.title, { color: colors.text }]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles[variant],
          { color: isFine ? colors.textSubtle : colors.textMuted },
        ]}
      >
        {body}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: 14 },
  fineRoot: { gap: 6, marginTop: 4 },
  title: { fontFamily: FONTS.regular, fontSize: 17, lineHeight: 23.8 },
  fineTitle: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 16.8 },
  lead: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 19.6 },
  note: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
  fine: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
});
