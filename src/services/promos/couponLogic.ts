import { ApiError } from '@/services/api/apiClient';

import type { CouponOffer, CouponReason } from './promoApi';

const KNOWN_REASONS: ReadonlySet<CouponReason> = new Set([
  'not_found',
  'wrong_role',
  'not_started',
  'expired',
  'used_up',
  'already_used',
  'wrong_booking_type',
  'below_minimum',
  'not_applicable',
]);

const CODE_PATTERN = /^[A-Z0-9_-]{2,40}$/;

export function normalizeCode(raw: string): string {
  return raw.replace(/\s+/g, '').toUpperCase();
}

export function isValidCodeFormat(code: string): boolean {
  return CODE_PATTERN.test(code);
}

export function reasonKey(reason: string | null | undefined): string {
  return reason && KNOWN_REASONS.has(reason as CouponReason)
    ? `coupons.reason.${reason}`
    : 'coupons.reason.generic';
}

/** Translation key for why applying a coupon failed. */
export function couponErrorKey(error: unknown): string {
  if (!(error instanceof ApiError)) return 'coupons.reason.generic';
  if (error.code === 'network_error') return 'coupons.networkError';
  if (error.code === 'price_changed') return 'coupons.priceChanged';
  if (error.code === 'promo_invalid') {
    return reasonKey((error.details as { reason?: string } | null)?.reason);
  }
  return 'coupons.reason.generic';
}

export function isCouponRejected(error: unknown): error is ApiError {
  return error instanceof ApiError && error.code === 'promo_invalid';
}

export type DiscountText = {
  key: string;
  values: Record<string, string | number>;
};

export function discountKey(offer: CouponOffer): DiscountText {
  const target = `coupons.target.${offer.applies_to}`;
  if (offer.discount_type === 'waive_fees') {
    return { key: 'coupons.discount.waive', values: { target } };
  }
  if (offer.discount_type === 'flat') {
    return {
      key: 'coupons.discount.flat',
      values: { amountMinor: Math.round(offer.discount_value * 100), target },
    };
  }
  return {
    key: 'coupons.discount.percent',
    values: { value: offer.discount_value, target },
  };
}

/** Usable first; within each group, coupons assigned to this Business first. */
export function sortOffers(offers: CouponOffer[]): CouponOffer[] {
  const rank = (o: CouponOffer) =>
    (o.eligible ? 0 : 2) + (o.is_voucher ? 0 : 1);
  return [...offers].sort((a, b) => rank(a) - rank(b));
}
