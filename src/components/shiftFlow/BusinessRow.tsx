import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import BadgeCheckIcon from '@/assets/figma/badge-check.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** Business line on shift details: icon tile, name, meta, verified badge. */
export const BusinessRow: FC<{
  icon: FC<SvgProps>;
  name: string;
  meta: string;
  isVerified: boolean;
}> = ({ icon: Icon, name, meta, isVerified }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <View style={[styles.tile, { backgroundColor: colors.fill }]}>
        <Icon width={20} height={20} color={colors.primary} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>{meta}</Text>
      </View>
      {isVerified ? (
        <BadgeCheckIcon width={20} height={20} color={colors.primary} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  name: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 19.6 },
  meta: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
});
