import type { FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SegmentedControl } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import ChevronRightIcon from '@/assets/figma/chevron-right.svg';
import { useBusinessPaymentStore } from '@/services/business/useBusinessPaymentStore';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps, BusinessPaymentRecord } from '@/types';
import { formatRupees } from '@/utils/format';

type Filter = 'all' | 'paid' | 'pending';

const SAMPLE_PAYMENTS: BusinessPaymentRecord[] = [
  {
    id: 'KN-48213',
    role: 'Café service',
    business: 'Third Wave Coffee',
    date: '18 Oct',
    amount: 1890,
    method: 'googlePay',
    status: 'paid',
  },
  {
    id: 'KN-48208',
    role: 'Event service',
    business: 'Third Wave Coffee',
    date: '14 Oct',
    amount: 3200,
    method: 'upiQr',
    status: 'paid',
  },
  {
    id: 'KN-48197',
    role: 'Café service',
    business: 'Third Wave Coffee',
    date: '10 Oct',
    amount: 1450,
    method: 'cards',
    status: 'paid',
  },
  {
    id: 'KN-48184',
    role: 'Guest service',
    business: 'Third Wave Coffee',
    date: '8 Oct',
    amount: 980,
    method: 'paytm',
    status: 'pending',
  },
];

export const BusinessPaymentHistoryPage: FC<
  AppScreenProps<typeof ROUTES.businessPaymentHistory>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const records = useBusinessPaymentStore(state => state.records);
  const [filter, setFilter] = useState<Filter>('all');
  const allPayments = useMemo(
    () => [...records, ...SAMPLE_PAYMENTS.filter(sample => !records.some(record => record.id === sample.id))],
    [records],
  );
  const visiblePayments = allPayments.filter(
    payment => filter === 'all' || payment.status === filter,
  );
  const paidTotal = allPayments
    .filter(payment => payment.status === 'paid')
    .reduce((total, payment) => total + payment.amount, 0);
  const pendingCount = allPayments.filter(
    payment => payment.status === 'pending',
  ).length;

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessPayment.historyTitle')}
      gap={12}
      testID="business-payment-history-page"
    >
      <View style={[styles.summary, { backgroundColor: colors.fill }]}>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>
          {t('businessPayment.paidThisMonth')}
        </Text>
        <Text style={[styles.total, { color: colors.text }]}>
          {formatRupees(paidTotal)}
        </Text>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>
          {t('businessPayment.paymentCounts', {
            paid: allPayments.length - pendingCount,
            pending: pendingCount,
          })}
        </Text>
      </View>

      <SegmentedControl
        segments={[
          { id: 'all', label: t('businessPayment.filterAll') },
          { id: 'paid', label: t('businessPayment.filterPaid') },
          { id: 'pending', label: t('businessPayment.filterPending') },
        ]}
        value={filter}
        onChange={setFilter}
      />

      <View style={[styles.list, { borderColor: colors.border }]}>
        {visiblePayments.map((payment, index) => (
          <Pressable
            key={payment.id}
            accessibilityRole="button"
            accessibilityLabel={t('businessPayment.openPaymentDetails', {
              role: payment.role,
              amount: formatRupees(payment.amount),
            })}
            onPress={() =>
              navigation.navigate(ROUTES.businessPaymentDetail, { payment })
            }
            style={[
              styles.row,
              { borderBottomColor: colors.border },
              index > 0 && {
                borderTopWidth: StyleSheet.hairlineWidth,
                borderTopColor: colors.border,
              },
            ]}
            testID={`business-payment-history-${payment.id}`}
          >
            <View style={styles.copy}>
              <Text style={[styles.role, { color: colors.text }]}>
                {payment.role}
              </Text>
              <Text style={[styles.meta, { color: colors.textSubtle }]}>
                {t('businessPayment.historyMeta', {
                  date: payment.date,
                  method: t(`businessPayment.methods.${payment.method}`),
                })}
              </Text>
            </View>
            <View style={styles.amountCopy}>
              <Text style={[styles.role, { color: colors.text }]}>
                {formatRupees(payment.amount)}
              </Text>
              <Text
                style={[
                  styles.status,
                  {
                    color:
                      payment.status === 'paid'
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              >
                {t(`businessPayment.status.${payment.status}`)}
              </Text>
            </View>
            <ChevronRightIcon width={16} height={16} color={colors.textSubtle} />
          </Pressable>
        ))}
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  summary: { borderRadius: 14, padding: 13, gap: 2 },
  meta: { fontFamily: FONTS.regular, fontSize: 9, lineHeight: 13 },
  total: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 28 },
  list: { borderTopWidth: StyleSheet.hairlineWidth },
  row: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 7,
  },
  copy: { flex: 1, gap: 1 },
  amountCopy: { alignItems: 'flex-end', gap: 1 },
  role: { fontFamily: FONTS.semiBold, fontSize: 10, lineHeight: 14 },
  status: { fontFamily: FONTS.semiBold, fontSize: 8, lineHeight: 12 },
});
