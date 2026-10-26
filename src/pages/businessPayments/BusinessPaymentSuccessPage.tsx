import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/ui';
import CheckIcon from '@/assets/icons/check.svg';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useBusinessLiveStore } from '@/services/business/useBusinessLiveStore';
import { useOnboardingStore } from '@/services/onboarding/useOnboardingStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps, BusinessPaymentDetails } from '@/types';
import { formatRupees } from '@/utils/format';

import { getBusinessLivePaymentTotal } from './paymentUtils';
import { BUSINESS_DASHBOARD } from '@/pages/businessLive/mock';

export const BusinessPaymentSuccessPage: FC<
  AppScreenProps<typeof ROUTES.businessPaymentSuccess>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const request = useBusinessLiveStore(state => state.activeRequest);
  const businessName =
    useOnboardingStore(state => state.business?.businessName) ??
    BUSINESS_DASHBOARD.businessName;

  const payment: BusinessPaymentDetails | undefined =
    route.params.payment ??
    (request
      ? {
          role: request.role,
          business: businessName,
          amount: getBusinessLivePaymentTotal(request),
          workerIds: request.acceptedWorkers.map(worker => worker.id),
          ...(request.acceptedWorkers.length === 1
            ? {
                workerId: request.acceptedWorkers[0].id,
                workerName: request.acceptedWorkers[0].name,
              }
            : {}),
        }
      : undefined);
  const ratableWorkerIds =
    payment?.workerIds ??
    (payment?.workerId ? [payment.workerId] : []);
  const amount = payment?.amount ?? 0;
  const method = t(`businessPayment.methods.${route.params.method}`);
  const openHistory = () =>
    navigation.navigate(ROUTES.mainTabs, {
      screen: ROUTES.businessProfile,
      params: { screen: ROUTES.businessPaymentHistory },
    });

  return (
    <FormScreen
      onBack={() => openHistory()}
      title={t('businessPayment.successTitle')}
      gap={14}
      testID="business-payment-success-page"
      actions={
        <>
          {ratableWorkerIds.length > 0 && payment ? (
            <PrimaryButton
              label={
                ratableWorkerIds.length > 1
                  ? t('businessRating.rateAllWorkers')
                  : t('businessRating.rateWorker', {
                      name:
                        payment.workerName ??
                        t('businessRating.workerFallback'),
                    })
              }
              onPress={() =>
                navigation.navigate(ROUTES.businessRateWorker, {
                  workerId: ratableWorkerIds[0],
                  role: payment.role,
                  business: payment.business,
                  workerIds: ratableWorkerIds,
                })
              }
              testID="business-payment-rate-worker"
            />
          ) : null}
          <PrimaryButton
            label={t('businessPayment.paymentHistory')}
            onPress={() => openHistory()}
          />
          <SecondaryButton
            label={t('businessPayment.backToBusiness')}
            onPress={() =>
              navigation.navigate(ROUTES.mainTabs, {
                screen: ROUTES.businessLive,
              })
            }
          />
        </>
      }
    >
      <View style={styles.success}>
        <View style={[styles.check, { backgroundColor: colors.successSoft }]}>
          <CheckIcon width={24} height={24} color={colors.success} />
        </View>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
          {t('businessPayment.successTitle')}
        </Text>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>
          {t('businessPayment.successAmount', {
            amount: formatRupees(amount),
          })}
        </Text>
      </View>

      <View
        style={[
          styles.details,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        <Detail label={t('businessPayment.shift')} value={payment?.role ?? '—'} />
        <Detail
          label={t('businessPayment.business')}
          value={payment?.business ?? '—'}
        />
        <Detail label={t('businessPayment.method')} value={method} />
        <Detail label={t('businessPayment.reference')} value={route.params.reference} />
      </View>
      <Text style={[styles.note, { color: colors.textSubtle }]}>
        {t('businessPayment.demoReceiptNote')}
      </Text>
    </FormScreen>
  );
};

const Detail: FC<{ label: string; value: string }> = ({ label, value }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.detail}>
      <Text style={[styles.meta, { color: colors.textSubtle }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  success: { alignItems: 'center', gap: 5, paddingVertical: 10 },
  check: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontFamily: FONTS.bold, fontSize: 19, lineHeight: 25, textAlign: 'center' },
  meta: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 15 },
  details: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12 },
  detail: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#7D8393',
  },
  detailValue: {
    flexShrink: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'right',
  },
  note: { fontFamily: FONTS.regular, fontSize: 9, lineHeight: 14 },
});
