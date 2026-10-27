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

export type BookingType = 'live' | 'shift';

export type CouponReason =
  | 'not_found'
  | 'wrong_role'
  | 'not_started'
  | 'expired'
  | 'used_up'
  | 'already_used'
  | 'wrong_booking_type'
  | 'below_minimum'
  | 'not_applicable';

/** A coupon as the server sees it for this Business and booking (never computed locally). */
export type CouponOffer = PromoView & {
  title: string;
  min_booking_minor: number | null;
  booking_types: 'all' | 'shift' | 'live';
  eligible: boolean;
  ineligible_reason: CouponReason | null;
  message: string | null;
};

export type WorkerPromoStatus = { pending: PromoView | null };

const withAmount = (amountMinor: number | null) =>
  amountMinor == null ? {} : { amount_minor: amountMinor };

export const promoApi = {
  /** Coupons assigned to this Business plus listed general ones, each with eligibility. */
  available: (bookingType: BookingType, amountMinor: number | null) =>
    apiRequest<{ items: CouponOffer[] }>(
      'GET',
      '/business/promo-codes/available',
      {
        query: { booking_type: bookingType, ...withAmount(amountMinor) },
      },
    ),
  /** 400 `promo_invalid` with `details.reason` when the code can't be used. */
  validate: (
    code: string,
    bookingType: BookingType,
    amountMinor: number | null,
  ) =>
    apiRequest<CouponOffer>('POST', '/business/promo-codes/validate', {
      body: { code, booking_type: bookingType, ...withAmount(amountMinor) },
    }),
  businessVouchers: () =>
    apiRequest<{ items: PromoView[] }>('GET', '/business/promo-codes'),
  workerStatus: () =>
    apiRequest<WorkerPromoStatus>('GET', '/worker/promo-codes'),
  /** 409 `promo_pending` while another code is still waiting for a payout. */
  redeem: (code: string) =>
    apiRequest<WorkerPromoStatus>('POST', '/worker/promo-codes/redeem', {
      body: { code },
    }),
};
