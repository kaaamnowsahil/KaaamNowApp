import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

import { ROUTES } from '@/constants/routes';
import i18n from '@/services/i18n/i18n';
import { toDashboardShift } from '@/services/shifts/shiftMappers';
import { shiftsApi, type BusinessShiftItem } from '@/services/shifts/shiftsApi';
import { useBusinessShiftsData } from '@/services/shifts/useBusinessShiftsData';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
import type { TabAppNavigation } from '@/types';

export const useBusinessShifts = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const data = useBusinessShiftsData();
  const { busy, run } = useShiftAction();
  const actionFailed = i18n.t('businessShifts.actionFailed');
  const rosterShift = data.scheduledShifts.find(item => item.booked_count > 0);

  const openShift = (item: BusinessShiftItem) => {
    if (item.pending_applications > 0) {
      navigation.navigate(ROUTES.businessApplicants);
      return;
    }
    navigation.navigate(ROUTES.businessRoster, { shiftId: item.id });
  };

  const openDraft = (item: BusinessShiftItem) => {
    if (busy) return;
    Alert.alert(
      i18n.t('businessShifts.publishDraftTitle'),
      i18n.t('businessShifts.publishDraftBody'),
      [
        {
          text: i18n.t('businessShifts.discardDraft'),
          style: 'destructive',
          onPress: () =>
            run(
              () =>
                shiftsApi.cancelShift(
                  item.id,
                  i18n.t('businessShifts.discardReason'),
                ),
              data.reload,
              actionFailed,
            ),
        },
        { text: i18n.t('common.cancel'), style: 'cancel' },
        {
          text: i18n.t('businessShifts.publish'),
          onPress: () =>
            run(
              () => shiftsApi.publishShift(item.id),
              data.reload,
              actionFailed,
            ),
        },
      ],
    );
  };

  return {
    isLoading: data.isLoading,
    error: data.error,
    reload: data.reload,
    businessName: data.businessName,
    isVerified: data.isVerified,
    liveShifts: data.liveShifts.map(item => ({
      item,
      card: toDashboardShift(item),
    })),
    scheduledShifts: data.scheduledShifts.map(item => ({
      item,
      card: toDashboardShift(item),
    })),
    drafts: data.drafts,
    roster: {
      staffedCount: data.scheduledShifts.reduce(
        (sum, item) => sum + item.booked_count,
        0,
      ),
      totalCount: data.scheduledShifts.reduce(
        (sum, item) => sum + item.workers_required,
        0,
      ),
    },
    openShift,
    openDraft,
    openRoster: () =>
      navigation.navigate(
        ROUTES.businessRoster,
        rosterShift ? { shiftId: rosterShift.id } : undefined,
      ),
    openSchedule: () => navigation.navigate(ROUTES.businessShiftSchedule),
  };
};
