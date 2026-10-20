import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useBusinessLiveStore } from '@/services/business/useBusinessLiveStore';
import { useBusinessPaymentStore } from '@/services/business/useBusinessPaymentStore';
import { useOnboardingStore } from '@/services/onboarding/useOnboardingStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps, BusinessPaymentDetails } from '@/types';
import { formatRupees } from '@/utils/format';

import { getBusinessLivePaymentTotal } from './paymentUtils';
import { BUSINESS_DASHBOARD } from '@/pages/businessLive/mock';

const qrModuleIsFilled = (x: number, y: number) => {
  const finder = (left: number, top: number) => {
    const dx = x - left;
    const dy = y - top;
    if (dx < 0 || dx > 6 || dy < 0 || dy > 6) return null;
    return (
      dx === 0 ||
      dx === 6 ||
      dy === 0 ||
      dy === 6 ||
      (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)
    );
  };
  const topLeft = finder(0, 0);
  const topRight = finder(14, 0);
  const bottomLeft = finder(0, 14);
  if (topLeft !== null) return topLeft;
  if (topRight !== null) return topRight;
  if (bottomLeft !== null) return bottomLeft;
  return (x * 17 + y * 31 + x * y * 7) % 5 < 2;
};

const DemoQr = () => (
  <View style={styles.qr} accessibilityLabel="Demo QR code">
    {Array.from({ length: 21 }, (_rowValue, rowIndex) => (
      <View key={rowIndex} style={styles.qrRow}>
        {Array.from({ length: 21 }, (_columnValue, columnIndex) => (
          <View
            key={columnIndex}
            style={[
              styles.qrModule,
              qrModuleIsFilled(columnIndex, rowIndex)
                ? styles.qrModuleFilled
                : styles.qrModuleEmpty,
            ]}
          />
        ))}
      </View>
    ))}
  </View>
);

export const BusinessPaymentScanPage: FC<
  AppScreenProps<typeof ROUTES.businessPaymentScan>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const request = useBusinessLiveStore(state => state.activeRequest);
  const addRecord = useBusinessPaymentStore(state => state.addRecord);
  const markWorkerPaid = useBusinessPaymentStore(
    state => state.markWorkerPaid,
  );
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

  if (!payment) {
    return (
      <FormScreen
        onBack={navigation.goBack}
        title={t('businessPayment.scanTitle')}
        testID="business-payment-scan-page"
      >
        <Text style={[styles.body, { color: colors.textSubtle }]}>
          {t('businessLiveCreate.requestUnavailableBody')}
        </Text>
      </FormScreen>
    );
  }

  const method = route.params.method;
  const completeDemoPayment = () => {
    const reference = `KN-${Date.now().toString().slice(-6)}`;
    const date = new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
    addRecord({
      id: reference,
      role: payment.role,
      business: payment.business,
      date: payment.date ?? date,
      amount: payment.amount,
      method,
      status: 'paid',
      workerId: payment.workerId,
      workerName: payment.workerName,
    });
    if (payment.workerId) markWorkerPaid(payment.workerId);
    navigation.replace(ROUTES.businessPaymentSuccess, {
      method,
      reference,
      payment,
    });
  };

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessPayment.scanTitle')}
      gap={14}
      testID="business-payment-scan-page"
      actions={
        <>
          <PrimaryButton
            label={t('businessPayment.completedPayment')}
            onPress={completeDemoPayment}
            testID="business-payment-complete"
          />
          <SecondaryButton
            label={t('businessPayment.chooseAnotherMethod')}
            onPress={navigation.goBack}
          />
        </>
      }
    >
      <View
        style={[
          styles.qrCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <DemoQr />
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatRupees(payment.amount)}
        </Text>
        <Text style={[styles.caption, { color: colors.textSubtle }]}>
          {t('businessPayment.scanWith', {
            method: t(`businessPayment.methods.${method}`),
          })}
        </Text>
      </View>
      <Text style={[styles.expiry, { color: colors.warning }]}>
        {t('businessPayment.qrDemo')}
      </Text>
      <Text style={[styles.body, { color: colors.textSubtle }]}>
        {t('businessPayment.scanInstructions')}
      </Text>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  qrCard: {
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  qr: { width: 176, height: 176, padding: 8, backgroundColor: '#FFFFFF' },
  qrRow: { flex: 1, flexDirection: 'row' },
  qrModule: { flex: 1 },
  qrModuleFilled: { backgroundColor: '#101321' },
  qrModuleEmpty: { backgroundColor: '#FFFFFF' },
  amount: { fontFamily: FONTS.bold, fontSize: 21, lineHeight: 27 },
  caption: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
  expiry: { fontFamily: FONTS.semiBold, fontSize: 10, textAlign: 'center' },
  body: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 15 },
});
