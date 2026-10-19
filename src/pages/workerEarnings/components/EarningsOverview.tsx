import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { formatRupees } from '@/utils/format';

import { WORKER_EARNINGS_STRINGS as S } from '../constants';
import type { EarningsSummary } from '../mock';

/** Figma Earnings (08): Pending / Processing tiles over the completed-payouts card. */
export const EarningsOverview: FC<{ summary: EarningsSummary }> = ({
  summary,
}) => {
  const { colors } = useTheme();
  const tile = [styles.tile, { backgroundColor: colors.fill }];

  return (
    <View style={styles.root}>
      <View style={styles.tiles}>
        <View style={tile}>
          <Text style={[styles.tileAmount, { color: colors.text }]}>
            {formatRupees(summary.pending)}
          </Text>
          <Text style={[styles.caption, { color: colors.textSubtle }]}>
            {S.PENDING}
          </Text>
        </View>
        <View style={tile}>
          <Text style={[styles.tileAmount, { color: colors.text }]}>
            {formatRupees(summary.processing)}
          </Text>
          <Text style={[styles.caption, { color: colors.textSubtle }]}>
            {S.PROCESSING}
          </Text>
        </View>
      </View>

      <View style={[styles.total, { backgroundColor: colors.fill }]}>
        <Text style={[styles.caption, { color: colors.textSubtle }]}>
          {summary.completedLabel}
        </Text>
        <Text style={[styles.totalAmount, { color: colors.text }]}>
          {formatRupees(summary.completed)}
        </Text>
        <Text style={[styles.caption, { color: colors.textSubtle }]}>
          {S.lastPaid(summary.lastPaid)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: 12 },
  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, borderRadius: 14, padding: 14, gap: 4 },
  tileAmount: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 26 },
  caption: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
  total: { borderRadius: 16, padding: 16, gap: 6 },
  totalAmount: { fontFamily: FONTS.bold, fontSize: 36, lineHeight: 44 },
});
