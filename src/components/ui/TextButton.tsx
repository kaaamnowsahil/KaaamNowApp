import type { FC } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Plain text action under a primary button: "Not now", "Skip for now" (Live shift 10). */
export const TextButton: FC<{
  label: string;
  onPress: () => void;
  tone?: 'default' | 'primary' | 'danger';
  testID?: string;
}> = ({ label, onPress, tone = 'default', testID }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={6}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text
        style={[
          styles.label,
          {
            color:
              tone === 'danger'
                ? colors.danger
                : tone === 'primary'
                  ? colors.primary
                  : colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: { height: 40, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
  label: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 19.6 },
});
