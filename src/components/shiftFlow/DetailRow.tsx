import type { FC, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import ChevronRight from '@/assets/figma/chevron-right.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Divided list row: optional icon, title + caption, chevron when tappable or a custom right slot. */
export const DetailRow: FC<{
  title: string;
  caption?: string;
  icon?: FC<SvgProps>;
  onPress?: () => void;
  right?: ReactNode;
  isLast?: boolean;
  /**
   * - compact: 13 / 10.5 text (Shift secured)
   * - regular: 14 / 12 text
   * - large: 15 / 12.5 text, 66px rows (You've been selected)
   */
  size?: 'compact' | 'regular' | 'large';
  testID?: string;
}> = ({
  title,
  caption,
  icon: Icon,
  onPress,
  right,
  isLast,
  size = 'regular',
  testID,
}) => {
  const { colors } = useTheme();
  const t = TEXT[size];
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.row,
        size === 'large' && styles.rowLarge,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      {Icon ? <Icon width={18} height={18} color={colors.primary} /> : null}
      <View style={[styles.text, size === 'large' && styles.textLarge]}>
        <Text
          style={[t.title, { color: colors.text }]}
        >
          {title}
        </Text>
        {caption ? (
          <Text
            style={[t.caption, { color: colors.textSubtle }]}
          >
            {caption}
          </Text>
        ) : null}
      </View>
      {right ??
        (onPress ? (
          <ChevronRight width={18} height={18} color={colors.textSubtle} />
        ) : null)}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  rowLarge: { paddingVertical: 14 },
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: 2 },
  textLarge: { gap: 0 },
});

const TEXT = {
  compact: StyleSheet.create({
    title: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
    caption: { fontFamily: FONTS.regular, fontSize: 10.5, lineHeight: 14.7 },
  }),
  regular: StyleSheet.create({
    title: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 19.6 },
    caption: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
  }),
  large: StyleSheet.create({
    title: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 21 },
    caption: { fontFamily: FONTS.regular, fontSize: 12.5, lineHeight: 17.5 },
  }),
};
