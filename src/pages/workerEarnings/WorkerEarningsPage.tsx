import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { EarningsRowItem } from '@/components/earnings';
import { InfoCallout } from '@/components/shiftFlow';
import {
  BrandAppBar,
  PrimaryButton,
  SecondaryButton,
  TextButton,
} from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { TabScreen } from '@/layout/TabScreen';
import { useTheme } from '@/theme/ThemeProvider';
import { formatDateLabel, fromMinor } from '@/services/shifts/shiftMappers';
import { formatRupees } from '@/utils/format';

import { EarningsOverview } from './components';
import { WORKER_EARNINGS_STRINGS as S } from './constants';
import { useWorkerEarnings } from './hooks/useWorkerEarnings';
import type { EarningsRow } from './mock';

const signedRupees = (amount: number) =>
  amount < 0 ? `−${formatRupees(-amount)}` : formatRupees(amount);

const rowMeta = (row: EarningsRow) => {
  const hourlyRate =
    row.hours && row.hours > 0 ? row.amount / row.hours : undefined;

  if (row.hours && row.hours > 0 && hourlyRate !== undefined) {
    return `${row.hours} h × ${formatRupees(hourlyRate)} = ${formatRupees(row.amount)}`;
  }

  if (row.shifts && row.shifts > 0) {
    const perShift = row.amount / row.shifts;
    return `${row.shifts} × ${formatRupees(perShift)} = ${formatRupees(row.amount)}`;
  }

  return [row.dateLabel, signedRupees(row.amount)].filter(Boolean).join(' · ');
};

/**
 * Worker "Earnings" tab. Figma: SH-17 · Worker earnings (light/dark).
 * Actions sit in a bordered bar pinned above the tab bar.
 * Dues, strikes and the promo field are not in Figma.
 * - state + data: hooks/useWorkerEarnings.ts
 */
export const WorkerEarningsPage: FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const earnings = useWorkerEarnings();
  const [promoCode, setPromoCode] = useState('');
  const reliability = earnings.reliability;

  const header = <BrandAppBar onBellPress={earnings.openNotifications} />;

  const blocks = [
    <View key="heading" style={styles.titleBlock}>
      <Text style={[styles.overline, { color: colors.primary }]}>
        {t('workerEarnings.overline')}
      </Text>
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text }]}
      >
        {t('workerEarnings.heading')}
      </Text>
    </View>,
    ...(earnings.duesMinor > 0
      ? [
        <View key="dues" style={[styles.card, { borderColor: colors.danger }]}>
          <Text style={[styles.cardTitle, { color: colors.danger }]}>
            {S.duesTitle(formatRupees(fromMinor(earnings.duesMinor)))}
          </Text>
          <Text style={[styles.cardBody, { color: colors.textMuted }]}>{S.DUES_BODY}</Text>
        </View>,
      ]
      : []),
    <EarningsOverview
      key="overview"
      summary={earnings.summary}
      onWithdraw={earnings.openWithdraw}
    />,
    ...(reliability
      ? [
        <View key="reliability" style={[styles.card, { borderColor: colors.border }]}>
          <View style={styles.cardHead}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{S.RELIABILITY}</Text>
            <Text
              style={[
                styles.cardTitle,
                { color: reliability.strikes > 0 ? colors.warning : colors.success },
              ]}
            >
              {S.strikes(reliability.strikes, reliability.strikes_to_ban)}
            </Text>
          </View>
          <Text style={[styles.cardBody, { color: colors.textMuted }]}>
            {S.strikesBody(reliability.window_days, reliability.strikes_to_limit)}
          </Text>
          {reliability.on_hold ? (
            <Text style={[styles.cardBody, { color: colors.danger }]}>{S.ON_HOLD}</Text>
          ) : reliability.feed_limited_until ? (
            <Text style={[styles.cardBody, { color: colors.warning }]}>
              {S.limitedUntil(formatDateLabel(reliability.feed_limited_until))}
            </Text>
          ) : null}
        </View>,
      ]
      : []),
    <View key="promo" style={styles.promo}>
      <Text style={[styles.promoLabel, { color: colors.textSubtle }]}>{S.PROMO_LABEL}</Text>
      {earnings.pendingPromo ? (
        <InfoCallout text={S.promoPending(earnings.pendingPromo.code)} />
      ) : (
        <View style={styles.promoRow}>
          <TextInput
            accessibilityLabel={S.PROMO_LABEL}
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder={S.PROMO_PLACEHOLDER}
            placeholderTextColor={colors.textSubtle}
            style={[
              styles.promoInput,
              { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            testID="earnings-promo-input"
          />
          <TextButton
            label={S.PROMO_REDEEM}
            tone="primary"
            onPress={async () => {
              if (await earnings.redeem(promoCode)) setPromoCode('');
            }}
            testID="earnings-promo-redeem"
          />
        </View>
      )}
    </View>,
    <View key="rows">
      {earnings.rows.length === 0 ? (
        <Text style={[styles.cardBody, { color: colors.textMuted }]}>{S.EMPTY}</Text>
      ) : null}
      {earnings.rows.map((row, index) => (
        <EarningsRowItem
          key={row.id}
          title={row.title}
          meta={rowMeta(row)}
          status={row.status}
          statusLabel={earnings.entryLabel(row)}
          isLast={index === earnings.rows.length - 1}
          onPress={() => earnings.openEarningDetail(row)}
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
            label={t('workerEarnings.viewAll')}
            onPress={earnings.openAllEarnings}
            testID="earnings-view-all"
          />
          <SecondaryButton
            label={t('workerEarnings.support')}
            onPress={earnings.openSupport}
            testID="earnings-support"
          />
        </>
      }
    />
  );
};

const styles = StyleSheet.create({
  titleBlock: { gap: 4 },
  overline: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    lineHeight: 15,
    letterSpacing: 0.5,
  },
  title: { fontFamily: FONTS.bold, fontSize: 24, lineHeight: 32 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  cardTitle: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
  cardBody: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  promo: { gap: 6 },
  promoLabel: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15 },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  promoInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
});
