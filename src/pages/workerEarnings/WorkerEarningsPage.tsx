import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    : S.groupMeta(
        row.shifts ?? 0,
        formatRupees(row.shifts ? row.amount / row.shifts : row.amount),
        formatRupees(row.amount),
      );

/**
 * Worker "Earnings" tab. Figma: SH-17 · Worker earnings (light/dark).
 * Actions sit in a bordered bar pinned above the tab bar.
 * - state: hooks/useWorkerEarnings.ts
 * - data: mock/workerEarningsMock.ts
 */
export const WorkerEarningsPage: FC = () => {
  const { colors } = useTheme();
  const earnings = useWorkerEarnings();

  const header = (
    <>
      <BackButton onPress={earnings.goBack} />
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        style={[styles.barTitle, { color: colors.text }]}
      >
        {S.TITLE}
      </Text>
      <Text style={[styles.barTag, { color: colors.textSubtle }]}>
        {S.HEADER_TAG}
      </Text>
    </>
  );

  const blocks = [
    <View key="heading" style={styles.heading}>
      <Text style={[styles.period, { color: colors.primary }]}>
        {earnings.summary.periodLabel}
      </Text>
      <View style={styles.titleBlock}>
        <Text style={[styles.overline, { color: colors.primary }]}>
          {S.OVERLINE}
        </Text>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}
        >
          {S.HEADING}
        </Text>
      </View>
    </View>,
    <EarningsOverview
      key="overview"
      summary={earnings.summary}
      onWithdraw={earnings.openWithdraw}
    />,
    <View key="rows">
      {earnings.rows.map(row => (
        <EarningsRowItem
          key={row.id}
          title={row.title}
          meta={rowMeta(row)}
          status={row.status}
          statusLabel={S.STATUS[row.status]}
        />
      ))}
    </View>,
  ];

  return (
    <TabScreen
      header={header}
      blocks={blocks}
      gap={20}
      isLoading={earnings.isLoading}
      testID="worker-earnings-page"
      actions={
        <>
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
        </>
      }
    />
  );
};

const styles = StyleSheet.create({
  barTitle: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    lineHeight: 21,
  },
  barTag: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 17 },
  heading: { gap: 20, marginTop: 6 },
  period: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 17 },
  titleBlock: { gap: 4 },
  overline: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.5,
  },
  title: { fontFamily: FONTS.bold, fontSize: 24, lineHeight: 32 },
});
