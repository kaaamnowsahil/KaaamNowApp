import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import type { PayoutStatus } from '@/types';

/** Figma Earnings (08) list row: title + meta on the left, coloured status on the right. */
export const EarningsRowItem: FC<{
  title: string;
  meta: string;
  status: PayoutStatus;
  statusLabel: string;
  isLast?: boolean;
}> = ({ title, meta, status, statusLabel, isLast }) => {
  const { colors } = useTheme();
  const statusColor: Record<PayoutStatus, string> = {
    pending: colors.warning,
    processing: colors.warning,
    completed: colors.success,
  };

  return (
    <View
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>{meta}</Text>
      </View>
      <Text style={[styles.status, { color: statusColor[status] }]}>
        {statusLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
  },
  text: { flex: 1, gap: 2 },
  title: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 19.6 },
  meta: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
  status: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 15.4 },
});
