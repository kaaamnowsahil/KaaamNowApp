import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type HelpCardProps = {
  title: string;
  caption: string;
  actionLabel: string;
  onPress: () => void;
};

/** Figma "Still need help?" card with an inset outlined button. */
export const HelpCard: FC<HelpCardProps> = ({
  title,
  caption,
  actionLabel,
  onPress,
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.fill, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.caption, { color: colors.textSubtle }]}>
        {caption}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        testID="faq-contact"
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: colors.background, borderColor: colors.border },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.buttonLabel, { color: colors.text }]}>
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 16 },
  title: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 22 },
  caption: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 2,
  },
  button: {
    height: 42,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  buttonLabel: { fontFamily: FONTS.semiBold, fontSize: 13 },
});
