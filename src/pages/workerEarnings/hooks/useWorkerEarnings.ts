import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { errorMessage } from '@/services/api/apiClient';
import { earningsApi, type LedgerEntry } from '@/services/earnings/earningsApi';
import { promoApi } from '@/services/promos/promoApi';
import { formatDateLabel, fromMinor } from '@/services/shifts/shiftMappers';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { formatRupees } from '@/utils/format';
import type { TabAppNavigation } from '@/types';

import { WORKER_EARNINGS_STRINGS as S } from '../constants';
import type { EarningsRow, EarningsSummary } from '../mock';

const toRow = (entry: LedgerEntry): EarningsRow => ({
  id: entry.id,
  title: entry.description || S.ENTRY_TYPE[entry.entry_type],
  dateLabel: formatDateLabel(entry.created_at),
  amount: fromMinor(entry.amount_minor),
  status: entry.amount_minor < 0 ? 'failed' : 'completed',
});

/**
 * Worker earnings tab.
 * - data: GET /worker/earnings (balance, dues, strikes, recent ledger), GET /worker/promo-codes
 */
export const useWorkerEarnings = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const query = useApiQuery(() => earningsApi.summary(), []);
  const promo = useApiQuery(() => promoApi.workerStatus(), []);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const data = query.data;
  const recent = data?.recent ?? [];

  const summary: EarningsSummary = {
    pending: fromMinor(data?.pending_minor ?? 0),
    processing: fromMinor(data?.in_flight_withdrawals_minor ?? 0),
    completed: fromMinor(Math.max(data?.available_minor ?? 0, 0)),
    periodLabel: S.AVAILABLE,
    lastPaid: S.thisMonth(
      formatRupees(fromMinor(data?.this_month_minor ?? 0)),
      data?.completed_shifts ?? 0,
    ),
  };
  const rows = recent.map(toRow);
  const entryTypes = Object.fromEntries(recent.map(entry => [entry.id, entry.entry_type]));

  const redeem = async (code: string) => {
    if (!code.trim() || isRedeeming) return false;
    setIsRedeeming(true);
    try {
      promo.setData(await promoApi.redeem(code.trim()));
      Alert.alert(S.PROMO_DONE, S.promoPending(code.trim()));
      return true;
    } catch (error) {
      Alert.alert(S.PROMO_FAILED, errorMessage(error));
      return false;
    } finally {
      setIsRedeeming(false);
    }
  };

  return {
    isLoading: query.isLoading,
    error: query.error,
    summary,
    rows,
    entryLabel: (row: EarningsRow) => {
      const type = entryTypes[row.id];
      return type ? S.ENTRY_TYPE[type] : '';
    },
    duesMinor: data?.dues_minor ?? 0,
    reliability: data?.reliability ?? null,
    pendingPromo: promo.data?.pending ?? null,
    isRedeeming,
    redeem,
    openNotifications: () => navigation.navigate(ROUTES.notifications),
    openAllEarnings: () => navigation.navigate(ROUTES.earningsHistory),
    openEarningDetail: (earning: EarningsRow) =>
      navigation.navigate(ROUTES.workerEarningDetail, {
        earning: {
          id: earning.id,
          title: earning.title,
          amount: earning.amount,
          status: earning.status,
          dateLabel: earning.dateLabel,
        },
      }),
    openWithdraw: () => navigation.navigate(ROUTES.withdraw),
    openSupport: () => navigation.navigate(ROUTES.faq),
  };
};
