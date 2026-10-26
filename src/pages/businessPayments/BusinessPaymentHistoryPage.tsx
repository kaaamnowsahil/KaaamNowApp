import type { FC } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ChevronRightIcon from '@/assets/figma/chevron-right.svg';
import WalletIcon from '@/assets/figma/wallet.svg';
import { EmptyState, SegmentedControl } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import {
  billingApi,
  type PaymentHistoryItem,
  type PaymentHistoryStatus,
} from '@/services/billing/billingApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { formatDay, formatMinor, methodKey } from './paymentHistoryFormat';

type Filter = 'all' | PaymentHistoryStatus;

export const BusinessPaymentHistoryPage: FC<
  AppScreenProps<typeof ROUTES.businessPaymentHistory>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const query = useApiQuery(
    () => billingApi.history(filter === 'all' ? undefined : filter),
    [filter],
  );
  const summary = query.data?.summary;
  const items = query.data?.items ?? [];
  const statusColor = (status: PaymentHistoryItem['status']) =>
    status === 'paid' ? colors.success : status === 'pending' ? colors.warning : colors.textSubtle;
  const rowMeta = (item: PaymentHistoryItem) => {
    const method = methodKey(item.payment_method);
    return t('businessPayment.historyMeta', {
      date: formatDay(item.shift_starts_at),
      method: method
        ? t(method)
        : t('businessPayment.workersCount', { count: item.worker_count }),
    });
  };

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessPayment.historyTitle')}
      gap={12}
      isLoading={query.isLoading}
      busy={query.isRefreshing}
      fillLastBlock={!items.length}
      testID="business-payment-history-page"
    >
      <View style={[styles.summary, { backgroundColor: colors.fill }]}>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>
          {t('businessPayment.paidThisMonth')}
        </Text>
        <Text style={[styles.total, { color: colors.text }]}>
          {formatMinor(summary?.paid_this_month_minor ?? 0)}
        </Text>
        {summary?.pending_minor ? (
          <Text style={[styles.meta, { color: colors.warning }]}>
            {t('businessPayment.pendingAmount', {
              amount: formatMinor(summary.pending_minor),
            })}
          </Text>
        ) : null}
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

      {query.error ? (
        <EmptyState
          icon={WalletIcon}
          title={t('businessPayment.loadErrorTitle')}
          body={query.error}
          action={t('businessPayment.retry')}
          onAction={query.reload}
        />
      ) : items.length ? (
        <View style={[styles.list, { borderColor: colors.border }]}>
          {items.map(item => (
            <Pressable
              key={item.invoice_id}
              accessibilityRole="button"
              accessibilityLabel={t('businessPayment.openPaymentDetails', {
                role: item.job_title,
                amount: formatMinor(item.total_minor),
              })}
              onPress={() => navigation.navigate(ROUTES.businessPaymentDetail, { item })}
              style={[styles.row, { borderBottomColor: colors.border }]}
              testID={`business-payment-history-${item.invoice_id}`}
            >
              <View style={styles.copy}>
                <Text style={[styles.role, { color: colors.text }]} numberOfLines={1}>
                  {item.job_title}
                </Text>
                <Text style={[styles.meta, { color: colors.textSubtle }]}>
                  {rowMeta(item)}
                </Text>
              </View>
              <View style={styles.amountCopy}>
                <Text style={[styles.role, { color: colors.text }]}>
                  {formatMinor(item.total_minor)}
                </Text>
                <Text style={[styles.status, { color: statusColor(item.status) }]}>
                  {t(`businessPayment.status.${item.status}`)}
                </Text>
              </View>
              <ChevronRightIcon width={16} height={16} color={colors.textSubtle} />
            </Pressable>
          ))}
        </View>
      ) : (
        <EmptyState
          icon={WalletIcon}
          title={t('businessPayment.emptyTitle')}
          body={t('businessPayment.emptyBody')}
        />
      )}
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  summary: { borderRadius: 14, padding: 13, gap: 2 },
  meta: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15 },
  total: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 28 },
  list: { borderTopWidth: StyleSheet.hairlineWidth },
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 9,
  },
  copy: { flex: 1, gap: 2 },
  amountCopy: { alignItems: 'flex-end', gap: 2 },
  role: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
  status: { fontFamily: FONTS.semiBold, fontSize: 11, lineHeight: 15 },
});
