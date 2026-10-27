import { apiRequest } from '@/services/api/apiClient';

import { promoApi } from '../promoApi';
import { useCouponSession } from '../useCouponSession';

jest.mock('@/services/api/apiClient', () => ({ apiRequest: jest.fn() }));

const request = apiRequest as jest.Mock;

describe('promoApi', () => {
  beforeEach(() => request.mockReset().mockResolvedValue({}));

  it('lists coupons for a booking, with the amount only when known', async () => {
    await promoApi.available('live', 90000);
    await promoApi.available('shift', null);
    expect(request).toHaveBeenNthCalledWith(
      1,
      'GET',
      '/business/promo-codes/available',
      {
        query: { booking_type: 'live', amount_minor: 90000 },
      },
    );
    expect(request).toHaveBeenNthCalledWith(
      2,
      'GET',
      '/business/promo-codes/available',
      {
        query: { booking_type: 'shift' },
      },
    );
  });

  it('validates a code for the booking', async () => {
    await promoApi.validate('SAVE10', 'shift', 50000);
    expect(request).toHaveBeenCalledWith(
      'POST',
      '/business/promo-codes/validate',
      {
        body: { code: 'SAVE10', booking_type: 'shift', amount_minor: 50000 },
      },
    );
  });

  it('keeps the voucher and worker endpoints', async () => {
    await promoApi.businessVouchers();
    await promoApi.workerStatus();
    await promoApi.redeem('REF1');
    expect(request.mock.calls).toEqual([
      ['GET', '/business/promo-codes'],
      ['GET', '/worker/promo-codes'],
      ['POST', '/worker/promo-codes/redeem', { body: { code: 'REF1' } }],
    ]);
  });
});

describe('useCouponSession', () => {
  const session = {
    bookingType: 'live' as const,
    amountMinor: 1000,
    appliedCode: null,
    apply: jest.fn(),
    remove: jest.fn(),
  };

  it('starts, records the applied code and ends', () => {
    useCouponSession.getState().setApplied('X');
    expect(useCouponSession.getState().session).toBeNull();
    useCouponSession.getState().start(session);
    useCouponSession.getState().setApplied('SAVE10');
    expect(useCouponSession.getState().session?.appliedCode).toBe('SAVE10');
    useCouponSession.getState().end();
    expect(useCouponSession.getState().session).toBeNull();
  });
});
