import { BRAND } from '@/constants/brand';

export const WITHDRAW_SUCCESS_STRINGS = {
  HEADING: 'Withdrawal initiated',
  subtitle: (amount: string, method: string) =>
    `${amount} is on its way to your ${method}`,
  AMOUNT: 'Amount',
  TO: 'To',
  METHOD: 'Method',
  REFERENCE: 'Reference',
  BACK: 'Back to earnings',
  DOWNLOAD: 'Download receipt',
  RECEIPT_TITLE: `${BRAND.NAME} withdrawal receipt`,
} as const;
