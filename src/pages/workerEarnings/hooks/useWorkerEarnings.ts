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
    openWithdraw: () => navigation.navigate(ROUTES.withdraw),
    openSupport: () => navigation.navigate(ROUTES.faq),
  };
};
