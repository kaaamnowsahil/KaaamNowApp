import { ApiError } from '@/services/api/apiClient';

import type { PayoutAccount } from '../earningsApi';
import {
  amountProblem,
  canWithdraw,
  defaultAccountId,
  minorToAmountText,
  newIdempotencyKey,
  parseAmountMinor,
  withdrawErrorKey,
  withdrawalTone,
} from '../withdrawLogic';

const account = (id: string, isDefault = false) =>
  ({ id, is_default: isDefault } as PayoutAccount);

describe('parseAmountMinor', () => {
  it.each([
    ['500', 50000],
    ['500.5', 50050],
    ['500.05', 50005],
    ['₹1,250.50', 125050],
    [' 12 ', 1200],
  ])('reads %s as %i paise', (input, minor) => {
    expect(parseAmountMinor(input)).toBe(minor);
  });

  it.each(['', '0', '0.00', 'abc', '1.234', '-5', '1e3', '12.', '1234567890'])(
    'rejects %j',
    input => {
      expect(parseAmountMinor(input)).toBeNull();
    },
  );
});

describe('minorToAmountText', () => {
  it('drops zero paise, pads the rest and round-trips', () => {
    expect(minorToAmountText(485000)).toBe('4850');
    expect(minorToAmountText(125050)).toBe('1250.50');
    expect(minorToAmountText(105)).toBe('1.05');
    for (const minor of [1, 99, 100, 12345, 485000]) {
      expect(parseAmountMinor(minorToAmountText(minor))).toBe(minor);
    }
  });
});

describe('amount rules', () => {
  it('flags invalid, too small and too large amounts', () => {
    expect(amountProblem(null, 10000, 5000)).toBe('invalid');
    expect(amountProblem(4999, 10000, 5000)).toBe('belowMin');
    expect(amountProblem(10001, 10000, 5000)).toBe('aboveAvailable');
    expect(amountProblem(5000, 10000, 5000)).toBeNull();
    expect(amountProblem(10000, 10000, 5000)).toBeNull();
  });

  it('needs a positive balance at or above the minimum', () => {
    expect(canWithdraw(5000, 5000)).toBe(true);
    expect(canWithdraw(4999, 5000)).toBe(false);
    expect(canWithdraw(0, 0)).toBe(false);
    expect(canWithdraw(-200, 0)).toBe(false);
  });
});

describe('defaultAccountId', () => {
  it('prefers the default account, then the first, then nothing', () => {
    expect(defaultAccountId([account('a'), account('b', true)])).toBe('b');
    expect(defaultAccountId([account('a'), account('b')])).toBe('a');
    expect(defaultAccountId([])).toBe('');
  });
});

describe('withdrawalTone', () => {
  it('groups server statuses for display', () => {
    expect(withdrawalTone('initiated')).toBe('pending');
    expect(withdrawalTone('processing')).toBe('pending');
    expect(withdrawalTone('paid')).toBe('paid');
    expect(withdrawalTone('failed')).toBe('failed');
  });
});

describe('newIdempotencyKey', () => {
  it('makes unique keys the server accepts', () => {
    const first = newIdempotencyKey();
    expect(first).toMatch(/^wd_[a-z0-9]{8,61}$/);
    expect(newIdempotencyKey()).not.toBe(first);
  });

  it('keeps its length when the random source is short', () => {
    expect(newIdempotencyKey(0, () => 0.5)).toBe('wd_0i0000000i0000000');
  });
});

describe('withdrawErrorKey', () => {
  it.each([
    ['withdrawal_below_min', 'belowMin'],
    ['insufficient_balance', 'aboveAvailable'],
    ['payout_account_not_found', 'accountMissing'],
    ['idempotency_mismatch', 'staleRequest'],
  ])('maps %s to %s', (code, key) => {
    expect(withdrawErrorKey(new ApiError('x', code, 409))).toBe(key);
  });

  it('leaves other errors to the generic message', () => {
    expect(withdrawErrorKey(new ApiError('x', 'internal', 500))).toBeNull();
    expect(withdrawErrorKey(new Error('offline'))).toBeNull();
  });
});
