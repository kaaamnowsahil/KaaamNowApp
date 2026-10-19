import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import InfoIcon from '@/assets/icons/info.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Soft bordered note with a leading icon (Live details, Check in, Finish — 10). */
export const InfoCallout: FC<{ text: string; icon?: FC<SvgProps> }> = ({
  text,
  icon: Icon = InfoIcon,
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.box,
        { backgroundColor: colors.fill, borderColor: colors.border },
      ]}
    >
      <Icon width={16} height={16} color={colors.primary} />
      <Text style={[styles.text, { color: colors.textMuted }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  text: { flex: 1, fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
});
