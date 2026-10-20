import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import CheckIcon from '@/assets/icons/check.svg';
import { SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

export const BusinessPaymentDetailPage: FC<
  AppScreenProps<typeof ROUTES.businessPaymentDetail>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { payment } = route.params;
  const statusColor =
    payment.status === 'paid' ? colors.success : colors.warning;

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessPayment.detailTitle')}
      gap={14}
      testID="business-payment-detail-page"
      actions={
        <SecondaryButton
          label={t('businessPayment.paymentHistory')}
          onPress={navigation.goBack}
          testID="business-payment-detail-history"
        />
      }
    >
      <View style={styles.status}>
        <View
          style={[
            styles.check,
            {
              backgroundColor:
                payment.status === 'paid' ? colors.successSoft : colors.fill,
            },
          ]}
        >
          {payment.status === 'paid' ? (
            <CheckIcon width={22} height={22} color={colors.success} />
          ) : (
            <Text style={[styles.pendingIcon, { color: colors.warning }]}>!</Text>
          )}
        </View>
        <Text style={[styles.total, { color: colors.text }]}>
          {formatRupees(payment.amount)}
        </Text>
        <Text style={[styles.statusLabel, { color: statusColor }]}>
          {t(`businessPayment.status.${payment.status}`)}
        </Text>
      </View>

      <View
        style={[
          styles.details,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        <Detail label={t('businessPayment.shift')} value={payment.role} />
        {payment.workerName ? (
          <Detail
            label={t('businessPayment.worker')}
            value={payment.workerName}
          />
        ) : null}
        <Detail label={t('businessPayment.business')} value={payment.business} />
        <Detail label={t('businessPayment.date')} value={payment.date} />
        <Detail
          label={t('businessPayment.method')}
          value={t(`businessPayment.methods.${payment.method}`)}
        />
        <Detail label={t('businessPayment.reference')} value={payment.id} />
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
    <View style={[styles.detail, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textSubtle }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  status: { alignItems: 'center', gap: 5, paddingVertical: 8 },
  check: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  total: { fontFamily: FONTS.bold, fontSize: 26, lineHeight: 32 },
  pendingIcon: { fontFamily: FONTS.bold, fontSize: 22 },
  statusLabel: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 16 },
  details: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12 },
  detail: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 15 },
  value: {
    flexShrink: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'right',
  },
  note: { fontFamily: FONTS.regular, fontSize: 9, lineHeight: 14 },
});
