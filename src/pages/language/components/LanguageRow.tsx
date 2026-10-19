import type { FC } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import CheckIcon from '@/assets/icons/check.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type LanguageRowProps = {
  label: string;
  caption: string;
  selected: boolean;
  isLast: boolean;
  onPress: () => void;
  testID?: string;
};

/** Figma Language list row: native name, English name, check when selected. */
export const LanguageRow: FC<LanguageRowProps> = ({
  label,
  caption,
  selected,
  isLast,
  onPress,
  testID,
}) => {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={caption}
      onPress={onPress}
      testID={testID}
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.caption, { color: colors.textSubtle }]}>
        {caption}
      </Text>
      {selected ? (
        <CheckIcon width={18} height={18} color={colors.primary} />
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 21 },
  caption: { flex: 1, fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
});
