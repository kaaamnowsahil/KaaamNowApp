import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Figma "Section heading" (1:1499): 18px title + 12px primary action. */
export const SectionHeading: FC<{
  title: string;
  action?: string;
  onAction?: () => void;
}> = ({ title, action, onAction }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
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
  title: { fontFamily: FONTS.regular, fontSize: 18, lineHeight: 26 },
  action: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 18 },
});
