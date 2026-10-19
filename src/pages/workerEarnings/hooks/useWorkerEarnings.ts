import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { TabAppNavigation } from '@/types';

import { ROWS, SUMMARY, type EarningsPeriod } from '../mock';

export const useWorkerEarnings = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const isLoading = useMockLoading();
  const [period, setPeriod] = useState<EarningsPeriod>('week');

  return {
    isLoading,
    period,
    togglePeriod: () => setPeriod(p => (p === 'week' ? 'month' : 'week')),
    summary: SUMMARY[period],
    rows: ROWS[period],
    goBack: () => navigation.navigate(ROUTES.workerHome),
    openAllEarnings: () => navigation.navigate(ROUTES.earningsHistory),
    openSupport: () => navigation.navigate(ROUTES.faq),
  };
};
