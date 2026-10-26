import type { FC } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Compact 44px outlined action with primary text: "View my shift",
 * "Review selected offer" (My shifts 08) and empty-state actions.
 */
export const OutlineButton: FC<{
  label: string;
  onPress: () => void;
  /** `primary` draws a purple outline (empty states); default is the card border. */
  tone?: 'neutral' | 'primary';
  disabled?: boolean;
  testID?: string;
}> = ({ label, onPress, tone = 'neutral', disabled = false, testID }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.disabled,
        {
          borderColor: tone === 'primary' ? colors.primary : colors.border,
          backgroundColor: pressed ? colors.primarySoft : 'transparent',
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  disabled: { opacity: 0.5 },
  label: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18.2 },
});
