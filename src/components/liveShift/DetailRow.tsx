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
  /** 13px title / 10.5px caption rows (Shift secured). */
  compact?: boolean;
  testID?: string;
}> = ({ title, caption, icon: Icon, onPress, right, isLast, compact, testID }) => {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      {Icon ? <Icon width={18} height={18} color={colors.primary} /> : null}
      <View style={styles.text}>
        <Text
          style={[
            compact ? styles.titleCompact : styles.title,
            { color: colors.text },
          ]}
        >
          {title}
        </Text>
        {caption ? (
          <Text
            style={[
              compact ? styles.captionCompact : styles.caption,
              { color: colors.textSubtle },
            ]}
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
  pressed: { opacity: 0.7 },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 19.6 },
  caption: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
  titleCompact: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
  captionCompact: { fontFamily: FONTS.regular, fontSize: 10.5, lineHeight: 14.7 },
});
