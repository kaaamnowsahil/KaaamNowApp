import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BRAND_COLORS } from '@/constants/colors';
import { FlowHeading } from '@/components/shiftFlow';
import { PrimaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useBusinessLiveStore } from '@/services/business/useBusinessLiveStore';
import { useTheme } from '@/theme/ThemeProvider';
import { useOnboardingStore } from '@/services/onboarding/useOnboardingStore';
import type { AppScreenProps, BusinessPaymentMethod } from '@/types';
import { formatRupees } from '@/utils/format';

import { BUSINESS_DASHBOARD } from '@/pages/businessLive/mock';

import { getBusinessLivePaymentTotal } from './paymentUtils';

const METHODS: { id: BusinessPaymentMethod; icon: string }[] = [
  { id: 'googlePay', icon: 'G' },
  { id: 'paytm', icon: 'P' },
  { id: 'applePay', icon: 'A' },
  { id: 'upiQr', icon: 'QR' },
  { id: 'cards', icon: '▣' },
];

export const BusinessPaymentMethodPage: FC<
  AppScreenProps<typeof ROUTES.businessPaymentMethod>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const request = useBusinessLiveStore(state => state.activeRequest);
  const businessName =
    useOnboardingStore(state => state.business?.businessName) ??
    BUSINESS_DASHBOARD.businessName;
  const [selectedMethod, setSelectedMethod] =
    useState<BusinessPaymentMethod>('googlePay');

  const livePayment = request
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
    : undefined;
  const payment = route.params?.payment ?? livePayment;
  if (!payment) {
    return (
      <FormScreen
        onBack={navigation.goBack}
        title={t('businessPayment.title')}
        testID="business-payment-method-page"
      >
        <FlowHeading
          title={t('businessLiveCreate.requestUnavailable')}
          subtitle={t('businessLiveCreate.requestUnavailableBody')}
        />
      </FormScreen>
    );
  }
  const amount = payment.amount;

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessPayment.title')}
      gap={14}
      testID="business-payment-method-page"
      actions={
        <PrimaryButton
          label={t('businessPayment.payAmount', {
            amount: formatRupees(amount),
          })}
          onPress={() =>
            navigation.navigate(ROUTES.businessPaymentScan, {
              method: selectedMethod,
              payment,
            })
          }
          testID="business-payment-continue"
        />
      }
    >
      <View style={[styles.summary, { backgroundColor: colors.fill }]}>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>
          {t('businessPayment.finalShiftCost')}
        </Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatRupees(amount)}
        </Text>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>
          {t('businessPayment.businessRole', {
            business: payment.business,
            role: payment.role,
          })}
        </Text>
      </View>

      <Text style={[styles.overline, { color: colors.textSubtle }]}>
        {t('businessPayment.payWith')}
      </Text>
      <View
        accessibilityRole="radiogroup"
        style={[
          styles.options,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        {METHODS.map((method, index) => {
          const selected = selectedMethod === method.id;
          return (
            <Pressable
              key={method.id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setSelectedMethod(method.id)}
              style={[
                styles.option,
                index < METHODS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
              testID={`business-payment-method-${method.id}`}
            >
              <View
                style={[
                  styles.icon,
                  { backgroundColor: colors.primarySoft },
                ]}
              >
                <Text style={[styles.iconText, { color: colors.primary }]}>
                  {method.icon}
                </Text>
              </View>
              <View style={styles.copy}>
                <Text style={[styles.methodTitle, { color: colors.text }]}>
                  {t(`businessPayment.methods.${method.id}`)}
                </Text>
                <Text style={[styles.meta, { color: colors.textSubtle }]}>
                  {t(`businessPayment.methodDetails.${method.id}`)}
                </Text>
              </View>
              <View
                style={[
                  styles.radio,
                  { borderColor: selected ? colors.primary : colors.textSubtle },
                  selected && styles.radioSelected,
                ]}
              >
                {selected ? (
                  <View style={styles.radioInner} />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.security, { color: colors.textSubtle }]}>
        {t('businessPayment.secureNote')}
      </Text>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  summary: { borderRadius: 14, padding: 14, gap: 4 },
  meta: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
  amount: { fontFamily: FONTS.bold, fontSize: 24, lineHeight: 30 },
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.5,
  },
  options: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  option: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontFamily: FONTS.semiBold, fontSize: 12 },
  copy: { flex: 1, gap: 1 },
  methodTitle: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 16 },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { backgroundColor: BRAND_COLORS.mark },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  security: { fontFamily: FONTS.regular, fontSize: 9, lineHeight: 14, textAlign: 'center' },
});
