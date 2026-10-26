import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { toneColor, type Tone } from '@/theme/tone';

/** Bordered card with title, caption and an optional purple badge ("Now"). */
export const InfoCard: FC<{
  title: string;
  caption: string;
  badge?: string;
  badgeTone?: Tone;
  icon?: FC<SvgProps>;
  onPress?: () => void;
  testID?: string;
}> = ({ title, caption, badge, badgeTone = 'primary', icon: Icon, onPress, testID }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.card,
        { borderColor: colors.border },
        pressed && { backgroundColor: colors.fill },
      ]}
    >
      {Icon ? <Icon width={20} height={20} color={colors.primary} /> : null}
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.caption, { color: colors.textSubtle }]}>
          {caption}
        </Text>
      </View>
      {badge ? (
        <Text
          style={[
            styles.badge,
            { color: toneColor(colors, badgeTone) },
          ]}
        >
          {badge}
        </Text>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 19.6 },
  caption: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
  badge: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 15.4 },
});
