import { ApiError } from '@/services/api/apiClient';

import {
  couponErrorKey,
  discountKey,
  isCouponRejected,
  isValidCodeFormat,
  normalizeCode,
  reasonKey,
  sortOffers,
} from '../couponLogic';
import type { CouponOffer } from '../promoApi';

const offer = (over: Partial<CouponOffer> = {}): CouponOffer => ({
  id: 'id',
  code: 'SAVE10',
  title: '',
  discount_type: 'percent',
  discount_value: 10,
  applies_to: 'commission',
  max_discount_minor: null,
  min_booking_minor: null,
  booking_types: 'all',
  valid_until: null,
  is_voucher: false,
  eligible: true,
  ineligible_reason: null,
  message: null,
  ...over,
});

const invalid = (reason?: string) =>
  new ApiError('x', 'promo_invalid', 400, reason ? { reason } : null);

describe('coupon codes', () => {
  it('normalises spacing and case', () => {
    expect(normalizeCode(' save 10 ')).toBe('SAVE10');
  });

  it('accepts only 2–40 letters, digits, - and _', () => {
    expect(isValidCodeFormat('A1')).toBe(true);
    expect(isValidCodeFormat('NEW_YEAR-26')).toBe(true);
    expect(isValidCodeFormat('A')).toBe(false);
    expect(isValidCodeFormat('SAVE!')).toBe(false);
    expect(isValidCodeFormat('A'.repeat(41))).toBe(false);
  });
});

describe('error keys', () => {
  it('maps known reasons and falls back for unknown ones', () => {
    expect(reasonKey('expired')).toBe('coupons.reason.expired');
    expect(reasonKey('weird')).toBe('coupons.reason.generic');
    expect(reasonKey(null)).toBe('coupons.reason.generic');
  });

  it('explains each failure', () => {
    expect(couponErrorKey(invalid('used_up'))).toBe('coupons.reason.used_up');
    expect(couponErrorKey(invalid())).toBe('coupons.reason.generic');
    expect(couponErrorKey(new ApiError('x', 'price_changed', 409))).toBe(
      'coupons.priceChanged',
    );
    expect(couponErrorKey(new ApiError('x', 'network_error', 0))).toBe(
      'coupons.networkError',
    );
    expect(couponErrorKey(new ApiError('x', 'internal_error', 500))).toBe(
      'coupons.reason.generic',
    );
    expect(couponErrorKey(new Error('boom'))).toBe('coupons.reason.generic');
  });

  it('recognises only coupon refusals', () => {
    expect(isCouponRejected(invalid('expired'))).toBe(true);
    expect(isCouponRejected(new ApiError('x', 'price_changed', 409))).toBe(
      false,
    );
    expect(isCouponRejected(new Error('x'))).toBe(false);
  });
});

describe('discountKey', () => {
  it('describes percent, flat and waived coupons', () => {
    expect(discountKey(offer())).toEqual({
      key: 'coupons.discount.percent',
      values: { value: 10, target: 'coupons.target.commission' },
    });
    expect(
      discountKey(offer({ discount_type: 'flat', discount_value: 50.5 })),
    ).toEqual({
      key: 'coupons.discount.flat',
      values: { amountMinor: 5050, target: 'coupons.target.commission' },
    });
    expect(
      discountKey(
        offer({ discount_type: 'waive_fees', applies_to: 'all_fees' }),
      ),
    ).toEqual({
      key: 'coupons.discount.waive',
      values: { target: 'coupons.target.all_fees' },
    });
  });
});

describe('sortOffers', () => {
  it('lists usable coupons first, assigned ones first within each group', () => {
    const items = [
      offer({ id: 'general-ineligible', eligible: false }),
      offer({ id: 'general' }),
      offer({ id: 'voucher-ineligible', eligible: false, is_voucher: true }),
      offer({ id: 'voucher', is_voucher: true }),
    ];
    expect(sortOffers(items).map(o => o.id)).toEqual([
      'voucher',
      'general',
      'voucher-ineligible',
      'general-ineligible',
    ]);
    expect(items[0].id).toBe('general-ineligible');
  });
});
