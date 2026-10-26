import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { errorMessage } from '@/services/api/apiClient';
import { payInvoice } from '@/services/billing/billingApi';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { ShiftFieldError } from './components';
import { formatShiftTime, parseLocalDate } from './utils';

const POSTED_STRINGS = {
  PAY_DEPOSIT: 'Pay deposit',
  PAY_FAILED: 'Payment didn’t go through',
  UNPAID_NOTE: 'Not live yet: workers can book once the deposit is paid.',
  DEPOSIT_PENDING: 'Deposit pending',
} as const;

export const BusinessShiftPostedPage: FC<
  AppScreenProps<typeof ROUTES.businessShiftPosted>
> = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const { draft, unpaidInvoiceIds = [] } = route.params;
  const { busy, run } = useShiftAction();
  const [payError, setPayError] = useState('');

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: false });
    return navigation.addListener('beforeRemove', event => {
      const { type } = event.data.action;
      if (type !== 'GO_BACK' && type !== 'POP') return;
      event.preventDefault();
      navigation.navigate(ROUTES.mainTabs, { screen: ROUTES.businessShifts });
    });
  }, [navigation]);
  const payDeposits = () => {
    setPayError('');
    run(
      async () => {
        for (const invoiceId of unpaidInvoiceIds) await payInvoice(invoiceId);
      },
      () => navigation.setParams({ unpaidInvoiceIds: [] }),
      POSTED_STRINGS.PAY_FAILED,
      error => {
        setPayError(`${POSTED_STRINGS.PAY_FAILED}: ${errorMessage(error)}`);
        return true;
      },
    );
  };
  const schedules = draft.schedules.map(schedule => ({
    date: new Intl.DateTimeFormat(i18n.language, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(parseLocalDate(schedule.date)),
    time: `${formatShiftTime(
      schedule.startTime,
      i18n.language,
    )} – ${formatShiftTime(schedule.endTime, i18n.language)}`,
  }));

  return (
    <FormScreen
      busy={busy}
      title={t('businessApplicants.headerTitle')}
      subtitle={t('businessShiftCreate.scheduledShiftSubtitle')}
      gap={12}
      testID="business-shift-posted-page"
      actions={
        <>
          {unpaidInvoiceIds.length ? (
            <PrimaryButton
              label={POSTED_STRINGS.PAY_DEPOSIT}
              disabled={busy}
              onPress={payDeposits}
              testID="business-shift-pay-deposit"
            />
          ) : null}
          <PrimaryButton
            label={t('businessShiftCreate.reviewApplicants')}
            onPress={() =>
              navigation.navigate(ROUTES.mainTabs, {
                screen: ROUTES.businessApplicants,
              })
            }
            testID="business-shift-review-applicants"
          />
        </>
      }
    >
      <Text style={[styles.overline, { color: colors.primary }]}>
        {t('businessShiftCreate.postedOverline')}
      </Text>
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text }]}
      >
        {t('businessShiftCreate.postedTitle')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
        {unpaidInvoiceIds.length
          ? POSTED_STRINGS.UNPAID_NOTE
          : t('businessShiftCreate.postedSubtitle')}
      </Text>
      <ShiftFieldError message={payError} />

      {schedules.map((schedule, index) => (
        <View
          key={draft.schedules[index]?.id ?? `${schedule.date}-${schedule.time}-${index}`}
          style={[
            styles.card,
            styles.shiftCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.shiftCopy}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {draft.schedules[index]?.role ?? draft.role}
            </Text>
            <Text style={[styles.caption, { color: colors.textSubtle }]}>
              {schedule.date} · {schedule.time}
            </Text>
          </View>
          <View
            style={[styles.statusPill, { backgroundColor: colors.successSoft }]}
            testID={`business-shift-status-${index}`}
          >
            <Text style={[styles.open, { color: colors.success }]}>
              {unpaidInvoiceIds.length
                ? POSTED_STRINGS.DEPOSIT_PENDING
                : t('businessShiftCreate.openShift')}
            </Text>
          </View>
        </View>
      ))}

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.applicationRow}>
          <View style={styles.applicationCopy}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {t('businessShiftCreate.applications')}
            </Text>
            <Text style={[styles.caption, { color: colors.textSubtle }]}>
              {t('businessShiftCreate.waiting')}
            </Text>
          </View>
          <Text style={[styles.count, { color: colors.textSubtle }]}>0</Text>
        </View>
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 9,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  title: { fontFamily: FONTS.bold, fontSize: 21, lineHeight: 28 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  card: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 4 },
  shiftCard: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  shiftCopy: { flex: 1, gap: 3 },
  cardTitle: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 17 },
  caption: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  open: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 15 },
  applicationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  applicationCopy: { flex: 1, gap: 4 },
  count: { fontFamily: FONTS.semiBold, fontSize: 10 },
});
