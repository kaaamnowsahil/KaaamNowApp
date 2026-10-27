import RazorpayCheckout from 'react-native-razorpay';

import { apiRequest } from '@/services/api/apiClient';
import { tr } from '@/services/i18n/tr';

export type PaymentMethodCode =
  | 'google_pay'
  | 'paytm'
  | 'apple_pay'
  | 'upi_qr'
  | 'card_netbanking';

export type Invoice = {
  id: string;
  shift_id: string;
  reference: string;
  invoice_kind: 'deposit' | 'final';
  status: 'pending' | 'paid' | 'void';
  currency: string;
  worker_subtotal_minor: number;
  platform_fee_minor: number;
  gateway_fee_minor: number;
  total_minor: number;
  deposit_applied_minor: number;
  amount_due_minor: number;
  refund_due_minor: number;
  promo_code?: string | null;
  promo_discount_minor: number;
  job_title: string;
  shift_starts_at: string;
  fee_percentage: number;
  gateway_fee_percentage: number;
  issued_at: string;
  paid_at?: string | null;
};

export type PaymentHistoryStatus = 'pending' | 'paid';

export type PaymentHistoryItem = {
  invoice_id: string;
  invoice_reference: string;
  shift_id: string;
  job_title: string;
  shift_starts_at: string;
  status: 'pending' | 'paid' | 'void';
  total_minor: number;
  currency: string;
  worker_count: number;
  paid_at?: string | null;
  payment_id?: string | null;
  payment_reference?: string | null;
  payment_method?: PaymentMethodCode | null;
};

export type PaymentHistoryPage = {
  summary: {
    paid_this_month_minor: number;
    pending_minor: number;
    currency: string;
  };
  items: PaymentHistoryItem[];
  limit: number;
  offset: number;
};

export type Payment = {
  id: string;
  invoice_id: string;
  method: PaymentMethodCode;
  provider: string;
  status: 'pending' | 'succeeded' | 'failed' | 'expired' | 'cancelled';
  amount_minor: number;
  currency: string;
  reference: string;
  upi_payload?: string | null;
  checkout_url?: string | null;
  provider_order_id: string;
  checkout_key?: string | null;
  failure_reason?: string | null;
};

export class PaymentNotCompletedError extends Error {}

export const billingApi = {
  invoice: (invoiceId: string) =>
    apiRequest<Invoice>('GET', `/business/invoices/${invoiceId}`),
  history: (status?: PaymentHistoryStatus) =>
    apiRequest<PaymentHistoryPage>('GET', '/business/payments', {
      query: status ? { status } : undefined,
    }),
  startPayment: (invoiceId: string, method: PaymentMethodCode) =>
    apiRequest<Payment>('POST', `/business/invoices/${invoiceId}/payments`, {
      body: { method },
    }),
  confirmPayment: (paymentId: string) =>
    apiRequest<Payment>('POST', `/business/payments/${paymentId}/confirm`),
  verifyRazorpay: (
    paymentId: string,
    body: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    },
  ) =>
    apiRequest<Payment>(
      'POST',
      `/business/payments/${paymentId}/razorpay-verify`,
      { body },
    ),
};

const CHECKOUT_NAME = 'KaaamNow';

const razorpayCheckout = async (payment: Payment) => {
  try {
    const result = await RazorpayCheckout.open({
      key: payment.checkout_key,
      order_id: payment.provider_order_id,
      amount: payment.amount_minor,
      currency: payment.currency,
      name: CHECKOUT_NAME,
      description: payment.reference,
    });
    return billingApi.verifyRazorpay(payment.id, result);
  } catch (error) {
    if (error instanceof Error) throw error;
    const description = (error as { description?: string } | null)?.description;
    throw new PaymentNotCompletedError(
      description || tr('errors.paymentCancelled'),
    );
  }
};

/** Starts one payment and settles it: Razorpay Checkout when live, a plain confirm for the fake provider. */
export const payInvoice = async (
  invoiceId: string,
  method: PaymentMethodCode = 'upi_qr',
) => {
  const payment = await billingApi.startPayment(invoiceId, method);
  const result =
    payment.provider === 'razorpay'
      ? await razorpayCheckout(payment)
      : await billingApi.confirmPayment(payment.id);
  if (result.status !== 'succeeded') {
    throw new PaymentNotCompletedError(
      result.failure_reason || tr('errors.paymentFailed'),
    );
  }
  return result;
};
