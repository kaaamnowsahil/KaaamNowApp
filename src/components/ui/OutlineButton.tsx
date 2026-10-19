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
  testID?: string;
}> = ({ label, onPress, tone = 'neutral', testID }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
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
  label: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18.2 },
});
