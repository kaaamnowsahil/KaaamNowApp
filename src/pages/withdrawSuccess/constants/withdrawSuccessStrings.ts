import { BRAND } from '@/constants/brand';
import { tr } from '@/services/i18n/tr';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`withdrawSuccess.${key}`, values);

export const WITHDRAW_SUCCESS_STRINGS = {
  get HEADING() {
    return k('heading');
  },
  get PAID_HEADING() {
    return k('paidHeading');
  },
  get FAILED_HEADING() {
    return k('failedHeading');
  },
  get FAILED_BODY() {
    return k('failedBody');
  },
  get STATUS() {
    return k('status');
  },
  get STATUS_PROCESSING() {
    return k('statusProcessing');
  },
  get STATUS_PAID() {
    return k('statusPaid');
  },
  get STATUS_FAILED() {
    return k('statusFailed');
  },
  get NOT_FOUND() {
    return k('notFound');
  },
  get PAYOUT_TIME() {
    return tr('withdraw.payoutTime');
  },
  get AMOUNT() {
    return k('amount');
  },
  get TO() {
    return k('to');
  },
  get REFERENCE() {
    return k('reference');
  },
  get BACK() {
    return k('back');
  },
  get DOWNLOAD() {
    return k('download');
  },
  get RECEIPT_TITLE() {
    return k('receiptTitle', { brand: BRAND.NAME });
  },
};
