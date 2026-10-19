import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EarningsRowItem } from '@/components/earnings';
import {
  BackButton,
  PrimaryButton,
  SecondaryButton,
} from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { TabScreen } from '@/layout/TabScreen';
import { useTheme } from '@/theme/ThemeProvider';
import { formatRupees } from '@/utils/format';

import { EarningsOverview } from './components';
import { WORKER_EARNINGS_STRINGS as S } from './constants';
import { useWorkerEarnings } from './hooks/useWorkerEarnings';
import type { EarningsRow } from './mock';

const rowMeta = (row: EarningsRow) =>
  row.hours && row.rate
    ? S.shiftMeta(row.hours, formatRupees(row.rate), formatRupees(row.amount))
    : S.groupMeta(row.shifts ?? 0, formatRupees(row.amount));

/**
 * Worker "Earnings" tab. Figma: 08 · WORKER — Main tabs, Worker earnings (light/dark).
 * - state: hooks/useWorkerEarnings.ts
 * - data: mock/workerEarningsMock.ts
 */
export const WorkerEarningsPage: FC = () => {
  const { colors } = useTheme();
  const earnings = useWorkerEarnings();
  const periodLabel = S.PERIOD_LABEL[earnings.period];

  const header = (
    <>
      <BackButton onPress={earnings.goBack} />
      <Text
        accessibilityRole="header"
        style={[styles.barTitle, { color: colors.text }]}
      >
        {S.TITLE}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={S.switchPeriod(periodLabel)}
        hitSlop={8}
        onPress={earnings.togglePeriod}
        style={styles.period}
        testID="earnings-period"
      >
        <Text style={[styles.periodText, { color: colors.textSubtle }]}>
          {periodLabel}
        </Text>
      </Pressable>
    </>
  );

  const blocks = [
    <View key="heading" style={styles.heading}>
      <Text style={[styles.overline, { color: colors.primary }]}>
        {S.OVERLINE}
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>{S.HEADING}</Text>
    </View>,
    <EarningsOverview key={`overview-${earnings.period}`} summary={earnings.summary} />,
    <View key={`rows-${earnings.period}`}>
      {earnings.rows.map((row, i) => (
        <EarningsRowItem
          key={row.id}
          title={row.title}
          meta={rowMeta(row)}
          status={row.status}
          statusLabel={S.STATUS[row.status]}
          isLast={i === earnings.rows.length - 1}
        />
      ))}
    </View>,
    <View key="actions" style={styles.actions}>
      <PrimaryButton
        label={S.VIEW_ALL}
        onPress={earnings.openAllEarnings}
        testID="earnings-view-all"
      />
      <SecondaryButton
        label={S.SUPPORT}
        onPress={earnings.openSupport}
        testID="earnings-support"
      />
    </View>,
  ];

  return (
    <TabScreen
      header={header}
      blocks={blocks}
      gap={16}
      isLoading={earnings.isLoading}
      testID="worker-earnings-page"
    />
  );
};

const styles = StyleSheet.create({
  barTitle: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 21 },
  period: { marginLeft: 'auto' },
  periodText: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
  heading: { gap: 2 },
  overline: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 16.8 },
  title: { fontFamily: FONTS.bold, fontSize: 26, lineHeight: 33.8 },
  actions: { gap: 10, marginTop: 4 },
});
