import type { FC } from 'react';
import { StyleSheet, Text } from 'react-native';

import { BRAND } from '@/constants/brand';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Registered company name under the profile settings. */
export const LegalFooter: FC = () => {
  const { colors } = useTheme();
  return (
    <Text style={[styles.text, { color: colors.textSubtle }]} testID="profile-legal">
      © {new Date().getFullYear()} {BRAND.COMPANY_LEGAL_NAME}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});
