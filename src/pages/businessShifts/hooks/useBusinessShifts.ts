import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

import { ROUTES } from '@/constants/routes';
import { payInvoice, PaymentNotCompletedError } from '@/services/billing/billingApi';
import i18n from '@/services/i18n/i18n';
import { toDashboardShift } from '@/services/shifts/shiftMappers';
import { shiftsApi, type BusinessShiftItem } from '@/services/shifts/shiftsApi';
import { useBusinessShiftsData } from '@/services/shifts/useBusinessShiftsData';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
import type { TabAppNavigation } from '@/types';

export const UNPAID_STRINGS = {
  heading: 'Payment pending',
  status: 'Deposit not paid · not live yet',
  title: 'Pay deposit to go live',
  body: 'Workers can book this shift only after the deposit is paid.',
  pay: 'Pay now',
  paidTitle: 'Shift is live',
  paidBody: 'Nearby workers can now book it.',
  failed: 'Payment didn’t go through',
};

export const useBusinessShifts = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const data = useBusinessShiftsData();
  const { busy, run } = useShiftAction();
  const actionFailed = i18n.t('businessShifts.actionFailed');
  const rosterShift = data.scheduledShifts.find(item => item.booked_count > 0);
  const isUnpaid = (item: BusinessShiftItem) =>
    item.status === 'awaiting_payment' && Boolean(item.deposit_invoice_id);

  const payDeposit = (item: BusinessShiftItem) => {
    if (busy || !item.deposit_invoice_id) return;
    const invoiceId = item.deposit_invoice_id;
    Alert.alert(UNPAID_STRINGS.title, UNPAID_STRINGS.body, [
      { text: i18n.t('common.cancel'), style: 'cancel' },
      {
        text: UNPAID_STRINGS.pay,
        onPress: () =>
          run(
            () => payInvoice(invoiceId),
            () => {
              data.reload();
              Alert.alert(UNPAID_STRINGS.paidTitle, UNPAID_STRINGS.paidBody);
            },
            UNPAID_STRINGS.failed,
            error => {
              if (!(error instanceof PaymentNotCompletedError)) return false;
              data.reload();
              return true;
            },
          ),
      },
    ]);
  };

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
    unpaidShifts: data.scheduledShifts.filter(isUnpaid),
    payDeposit,
    scheduledShifts: data.scheduledShifts.filter(item => !isUnpaid(item)).map(item => ({
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
