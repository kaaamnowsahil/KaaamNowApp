import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { formatRupees } from '@/utils/format';

import type { EarningsSummary } from '../types';

/**
 * Figma SH-17 Worker earnings: Pending / Processing tiles over the completed-payouts card.
 * The "Withdraw" pill is not in SH-17; it opens the 12 · Withdraw flow.
 */
export const EarningsOverview: FC<{
  summary: EarningsSummary;
  onWithdraw: () => void;
}> = ({ summary, onWithdraw }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const tiles = [
    { amount: summary.pending, label: t('workerEarnings.pending') },
    { amount: summary.processing, label: t('workerEarnings.processing') },
  ];

  return (
    <View style={styles.root}>
      <View style={styles.tiles}>
        {tiles.map(tile => (
          <View
            key={tile.label}
            style={[styles.tile, { backgroundColor: colors.fill }]}
          >
            <Text style={[styles.tileAmount, { color: colors.text }]}>
              {formatRupees(tile.amount)}
            </Text>
            <Text style={[styles.tileLabel, { color: colors.textSubtle }]}>
              {tile.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.total, { backgroundColor: colors.fill }]}>
        <View style={styles.totalHead}>
          <Text style={[styles.caption, styles.flex, { color: colors.textSubtle }]}>
            {summary.periodLabel}
          </Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={onWithdraw}
            testID="earnings-withdraw"
            style={({ pressed }) => [
              styles.pill,
              { backgroundColor: colors.primarySoft },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.pillText, { color: colors.primary }]}>
              {t('workerEarnings.withdraw')}
            </Text>
          </Pressable>
        </View>
        <Text style={[styles.totalAmount, { color: colors.text }]}>
          {formatRupees(summary.completed)}
        </Text>
        <Text style={[styles.caption, { color: colors.textSubtle }]}>
          {summary.lastPaid}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: 20 },
  tiles: { flexDirection: 'row', gap: 12 },
  tile: {
    flex: 1,
    minHeight: 82,
    borderRadius: 16,
    paddingHorizontal: 14,
    justifyContent: 'center',
    gap: 4,
  },
  tileAmount: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 28 },
  tileLabel: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  total: {
    minHeight: 146,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'center',
    gap: 8,
  },
  totalHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flex: { flex: 1 },
  pill: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  pillText: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 18 },
  caption: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 17 },
  totalAmount: { fontFamily: FONTS.bold, fontSize: 40, lineHeight: 48 },
});
