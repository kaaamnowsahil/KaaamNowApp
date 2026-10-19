import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

export type ReceiptLine = { label: string; value: string };

/** Bordered label / value table (12 · Withdrawal initiated: Amount, To, Method, Reference). */
export const ReceiptCard: FC<{ lines: ReceiptLine[] }> = ({ lines }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.fill, borderColor: colors.border },
      ]}
    >
      {lines.map((line, i) => (
        <View
          key={line.label}
          style={[
            styles.row,
            i < lines.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.label, { color: colors.textSubtle }]}>
            {line.label}
          </Text>
          <Text style={[styles.value, { color: colors.text }]}>
            {line.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  row: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
  },
  label: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
  value: { fontFamily: FONTS.semiBold, fontSize: 12.5, lineHeight: 17.5 },
});
