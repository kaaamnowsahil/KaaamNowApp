import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { FlowHeading } from '@/components/shiftFlow';
import { PrimaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useBusinessApplicantStore } from '@/pages/businessApplicants/store/useBusinessApplicantStore';
import { useBusinessPaymentStore } from '@/services/business/useBusinessPaymentStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

export const BusinessScheduledWorkerTrackingPage: FC<
  AppScreenProps<typeof ROUTES.businessScheduledWorkerTracking>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const worker = useBusinessApplicantStore(state =>
    state.applicants.find(item => item.id === route.params.applicantId),
  );
  const reachedWorkerIds = useBusinessPaymentStore(
    state => state.reachedWorkerIds,
  );
  const completedWorkerIds = useBusinessPaymentStore(
    state => state.completedWorkerIds,
  );
  const paidWorkerIds = useBusinessPaymentStore(state => state.paidWorkerIds);
  const markWorkerReached = useBusinessPaymentStore(
    state => state.markWorkerReached,
  );
  const markWorkerCompleted = useBusinessPaymentStore(
    state => state.markWorkerCompleted,
  );

  if (!worker) {
    return (
      <FormScreen
        onBack={navigation.goBack}
        title={t('businessScheduledShift.trackingTitle')}
        testID="business-scheduled-worker-tracking-page"
      >
        <FlowHeading
          title={t('businessScheduledShift.workerUnavailable')}
          subtitle={t('businessScheduledShift.workerUnavailableBody')}
        />
      </FormScreen>
    );
  }

  const { role, business, hourlyRate, hours, date } = route.params;
  const workerReached = reachedWorkerIds.includes(worker.id);
  const workerCompleted = completedWorkerIds.includes(worker.id);
  const workerPaid = paidWorkerIds.includes(worker.id);
  const subtotal = hourlyRate * hours;
  const paymentAmount = subtotal + Math.round(subtotal * 0.05);
  const progressLabel = workerPaid
    ? t('businessScheduledShift.paymentComplete')
    : workerCompleted
    ? t('businessScheduledShift.payWorker', { name: worker.name.split(' ')[0] })
    : workerReached
      ? t('businessScheduledShift.completeAndPay')
      : t('businessScheduledShift.markReached', {
          name: worker.name.split(' ')[0],
        });

  const updateProgress = () => {
    if (!workerReached) {
      markWorkerReached(worker.id);
      return;
    }
    if (!workerCompleted) {
      markWorkerCompleted(worker.id);
    }
    navigation.navigate(ROUTES.businessPaymentMethod, {
      payment: {
        role,
        business,
        amount: paymentAmount,
        date,
        workerId: worker.id,
        workerName: worker.name,
      },
    });
  };

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessScheduledShift.trackingTitle')}
      subtitle={t('businessShiftCreate.scheduledShiftSubtitle')}
      headerTag={t('businessApplicants.headerTag')}
      gap={12}
      testID="business-scheduled-worker-tracking-page"
      actions={
        <PrimaryButton
          label={progressLabel}
          onPress={updateProgress}
          disabled={workerPaid}
          testID="business-scheduled-worker-progress"
        />
      }
    >
      <View style={styles.heading}>
        <Text style={[styles.overline, { color: colors.primary }]}>
          {t('businessScheduledShift.progressOverline')}
        </Text>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}
        >
          {t('businessScheduledShift.shiftFor', {
            name: worker.name,
          })}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <ProgressRow
          label={t('businessScheduledShift.workerReached')}
          status={
            workerReached
              ? t('businessScheduledShift.done')
              : t('businessScheduledShift.waiting')
          }
          done={workerReached}
        />
        <ProgressRow
          label={t('businessScheduledShift.shiftCompleted')}
          status={
            workerCompleted
              ? t('businessScheduledShift.done')
              : t('businessScheduledShift.waiting')
          }
          done={workerCompleted}
        />
        <ProgressRow
          label={t('businessScheduledShift.payment')}
          status={
            workerPaid
              ? t('businessScheduledShift.done')
              : workerCompleted
                ? t('businessScheduledShift.next')
                : t('businessScheduledShift.waiting')
          }
          done={workerPaid}
        />
      </View>

      <View style={[styles.summary, { backgroundColor: colors.fill }]}>
        <Text style={[styles.summaryTitle, { color: colors.text }]}>{role}</Text>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>
          {business} · {date}
        </Text>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>
          {t('businessScheduledShift.hoursAndRate', {
            hours,
            rate: formatRupees(hourlyRate),
          })}
        </Text>
        <Text style={[styles.payment, { color: colors.text }]}>
          {t('businessScheduledShift.estimatedPayment', {
            amount: formatRupees(paymentAmount),
          })}
        </Text>
      </View>
    </FormScreen>
  );
};

const ProgressRow: FC<{ label: string; status: string; done: boolean }> = ({
  label,
  status,
  done,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.progressRow, { borderBottomColor: colors.border }]}>
      <View
        style={[
          styles.dot,
          { backgroundColor: done ? colors.success : colors.border },
        ]}
      />
      <Text style={[styles.progressLabel, { color: colors.text }]}>{label}</Text>
      <Text
        style={[
          styles.progressStatus,
          { color: done ? colors.success : colors.textSubtle },
        ]}
      >
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  heading: { gap: 4 },
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    lineHeight: 14,
  },
  title: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 27 },
  card: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12 },
  progressRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  progressLabel: { flex: 1, fontFamily: FONTS.regular, fontSize: 11 },
  progressStatus: { fontFamily: FONTS.semiBold, fontSize: 9 },
  summary: { borderRadius: 14, padding: 12, gap: 4 },
  summaryTitle: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 17 },
  meta: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 15 },
  payment: { marginTop: 2, fontFamily: FONTS.semiBold, fontSize: 11 },
});
