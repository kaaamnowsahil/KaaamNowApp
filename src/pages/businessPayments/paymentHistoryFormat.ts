import type { PaymentMethodCode } from '@/services/billing/billingApi';
import { formatRupees } from '@/utils/format';

const METHOD_KEYS: Record<PaymentMethodCode, string> = {
  google_pay: 'googlePay',
  paytm: 'paytm',
  apple_pay: 'applePay',
  upi_qr: 'upiQr',
  card_netbanking: 'cards',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const methodKey = (method?: PaymentMethodCode | null) =>
  method ? `businessPayment.methods.${METHOD_KEYS[method]}` : null;

/** 189000 paise -> "₹1,890" */
export const formatMinor = (minor: number) => formatRupees(Math.round(minor) / 100);

/** "2026-10-18T..." -> "18 Oct" */
export const formatDay = (iso: string) => {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
};

/** "2026-10-18T..." -> "18 Oct 2026" */
export const formatFullDay = (iso: string) => `${formatDay(iso)} ${new Date(iso).getFullYear()}`;
