import { useNavigation } from '@react-navigation/native';

import { ROUTES } from '@/constants/routes';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { TabAppNavigation } from '@/types';

import { ROWS, SUMMARY } from '../mock';

export const useWorkerEarnings = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const isLoading = useMockLoading();

  return {
    isLoading,
    summary: SUMMARY,
    rows: ROWS,
    goBack: () => navigation.navigate(ROUTES.workerHome),
    openAllEarnings: () => navigation.navigate(ROUTES.earningsHistory),
    openEarningDetail: (earning: (typeof ROWS)[number]) => {
      const normalizedEarning = {
        id: earning.id,
        title: earning.title,
        amount: earning.amount,
        status: earning.status,
        reference: earning.reference,
        method: earning.method,
        destination: earning.destination,
        requestedAt: earning.requestedAt,
        processedAt: earning.processedAt,
        failureReason: earning.failureReason,
        businessName: earning.businessName,
        dateLabel: earning.dateLabel,
        hours: earning.hours,
        rate:
          earning.hours && earning.hours > 0 && earning.amount
            ? earning.amount / earning.hours
            : undefined,
        shifts: earning.shifts,
      };

      navigation.navigate(ROUTES.workerEarningDetail, {
        earning: normalizedEarning,
      });
    },
    openWithdraw: () => navigation.navigate(ROUTES.withdraw),
    openSupport: () => navigation.navigate(ROUTES.faq),
  };
};
