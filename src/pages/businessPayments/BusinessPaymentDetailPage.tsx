import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import CheckIcon from '@/assets/icons/check.svg';
import WalletIcon from '@/assets/figma/wallet.svg';
import { EmptyState, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { billingApi } from '@/services/billing/billingApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { formatFullDay, formatMinor, methodKey } from './paymentHistoryFormat';

export const BusinessPaymentDetailPage: FC<
  AppScreenProps<typeof ROUTES.businessPaymentDetail>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { item } = route.params;
  const query = useApiQuery(() => billingApi.invoice(item.invoice_id), [item.invoice_id]);
  const invoice = query.data;
  const isPaid = item.status === 'paid';
  const statusColor = isPaid
    ? colors.success
    : item.status === 'pending'
    ? colors.warning
    : colors.textSubtle;
  const method = methodKey(item.payment_method);

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessPayment.detailTitle')}
      gap={14}
      isLoading={query.isLoading}
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
            { backgroundColor: isPaid ? colors.successSoft : colors.fill },
          ]}
        >
          {isPaid ? (
            <CheckIcon width={22} height={22} color={colors.success} />
          ) : (
            <Text style={[styles.pendingIcon, { color: statusColor }]}>!</Text>
          )}
        </View>
        <Text style={[styles.total, { color: colors.text }]}>
          {formatMinor(item.total_minor)}
        </Text>
        <Text style={[styles.statusLabel, { color: statusColor }]}>
          {t(`businessPayment.status.${item.status}`)}
        </Text>
      </View>

      <Section>
        <Detail label={t('businessPayment.shift')} value={item.job_title} />
        <Detail
          label={t('businessPayment.shiftDate')}
          value={formatFullDay(item.shift_starts_at)}
        />
        <Detail
          label={t('businessPayment.workers')}
          value={String(item.worker_count)}
        />
      </Section>

      {query.error ? (
        <EmptyState
          icon={WalletIcon}
          title={t('businessPayment.loadErrorTitle')}
          body={query.error}
          action={t('businessPayment.retry')}
          onAction={query.reload}
        />
      ) : invoice ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textSubtle }]}>
            {t('businessPayment.breakdown')}
          </Text>
          <Section>
            <Detail
              label={t('businessPayment.workerPay')}
              value={formatMinor(invoice.worker_subtotal_minor)}
            />
            <Detail
              label={t('businessPayment.serviceFee', { pct: invoice.fee_percentage })}
              value={formatMinor(invoice.platform_fee_minor)}
            />
            <Detail
              label={t('businessPayment.gatewayFee', {
                pct: invoice.gateway_fee_percentage,
              })}
              value={formatMinor(invoice.gateway_fee_minor)}
            />
            {invoice.promo_discount_minor > 0 ? (
              <Detail
                label={t('businessPayment.promoSavings', { code: invoice.promo_code ?? '' })}
                value={`−${formatMinor(invoice.promo_discount_minor)}`}
                valueColor={colors.success}
              />
            ) : null}
            <Detail
              label={t('businessPayment.total')}
              value={formatMinor(invoice.total_minor)}
              strong
            />
            {invoice.deposit_applied_minor > 0 ? (
              <Detail
                label={t('businessPayment.paidAtPosting')}
                value={`−${formatMinor(invoice.deposit_applied_minor)}`}
              />
            ) : null}
            {invoice.refund_due_minor > 0 ? (
              <Detail
                label={t('businessPayment.refundDue')}
                value={formatMinor(invoice.refund_due_minor)}
                valueColor={colors.success}
              />
            ) : null}
          </Section>
        </>
      ) : null}

      <Text style={[styles.sectionTitle, { color: colors.textSubtle }]}>
        {t('businessPayment.paymentInfo')}
      </Text>
      <Section>
        <Detail
          label={t('businessPayment.method')}
          value={method ? t(method) : t('businessPayment.awaitingPayment')}
        />
        {item.paid_at ? (
          <Detail
            label={t('businessPayment.paidOn')}
            value={formatFullDay(item.paid_at)}
          />
        ) : null}
        {item.payment_reference ? (
          <Detail
            label={t('businessPayment.reference')}
            value={item.payment_reference}
          />
        ) : null}
        <Detail label={t('businessPayment.invoice')} value={item.invoice_reference} />
      </Section>

      <Text style={[styles.note, { color: colors.textSubtle }]}>
        {t('businessPayment.feeNote')}
      </Text>
    </FormScreen>
  );
};

const Section: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[styles.details, { backgroundColor: colors.fill, borderColor: colors.border }]}
    >
      {children}
    </View>
  );
};

const Detail: FC<{
  label: string;
  value: string;
  strong?: boolean;
  valueColor?: string;
}> = ({ label, value, strong, valueColor }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.detail, { borderBottomColor: colors.border }]}>
      <Text style={[styles.label, { color: strong ? colors.text : colors.textSubtle }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.value,
          strong && styles.strong,
          { color: valueColor ?? colors.text },
        ]}
      >
        {value}
      </Text>
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
  statusLabel: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 16 },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 15,
    textTransform: 'uppercase',
  },
  details: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 12 },
  detail: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { flexShrink: 1, fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  value: {
    flexShrink: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'right',
  },
  strong: { fontFamily: FONTS.bold, fontSize: 13 },
  note: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
});
