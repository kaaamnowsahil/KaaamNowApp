import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

export type Fact = { icon: FC<SvgProps>; text: string };

/** Icon + one-line facts (date, duration, place) under the pay tiles. */
export const FactList: FC<{ items: Fact[] }> = ({ items }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.list}>
      {items.map(({ icon: Icon, text }) => (
        <View key={text} style={styles.row}>
          <Icon width={15} height={15} color={colors.textSubtle} />
          <Text style={[styles.text, { color: colors.textMuted }]}>{text}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  text: { flex: 1, fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
});
