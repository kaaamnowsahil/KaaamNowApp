import { apiRequest } from '@/services/api/apiClient';

export type PromoView = {
  id: string;
  code: string;
  /** ₹ for flat, % for percent, 0 for waive_fees. */
  discount_type: 'waive_fees' | 'flat' | 'percent';
  discount_value: number;
  applies_to: 'commission' | 'gateway' | 'all_fees';
  max_discount_minor: number | null;
  valid_until: string | null;
  is_voucher: boolean;
};

export type WorkerPromoStatus = { pending: PromoView | null };

export const promoApi = {
  /** 400 `promo_invalid` with a readable message when the code can't be used. */
  validate: (code: string) =>
    apiRequest<PromoView>('POST', '/business/promo-codes/validate', { body: { code } }),
  businessVouchers: () => apiRequest<{ items: PromoView[] }>('GET', '/business/promo-codes'),
  workerStatus: () => apiRequest<WorkerPromoStatus>('GET', '/worker/promo-codes'),
  /** 409 `promo_pending` while another code is still waiting for a payout. */
  redeem: (code: string) =>
    apiRequest<WorkerPromoStatus>('POST', '/worker/promo-codes/redeem', { body: { code } }),
};
