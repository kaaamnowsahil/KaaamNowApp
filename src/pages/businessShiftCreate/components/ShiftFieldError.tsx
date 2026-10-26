import type { FC } from 'react';
import { StyleSheet, Text } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Red helper text under a create-shift field; renders nothing without a message. */
export const ShiftFieldError: FC<{ message?: string }> = ({ message }) => {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <Text accessibilityLiveRegion="polite" style={[styles.error, { color: colors.danger }]}>
      {message}
    </Text>
  );
};

const styles = StyleSheet.create({
  error: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15 },
});
