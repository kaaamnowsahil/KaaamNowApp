import { useCallback, useEffect, useRef, useState } from 'react';

import {
  couponErrorKey,
  isValidCodeFormat,
  normalizeCode,
  sortOffers,
} from '@/services/promos/couponLogic';
import { promoApi, type CouponOffer } from '@/services/promos/promoApi';
import type { CouponSession } from '@/services/promos/useCouponSession';

export type CouponListState = 'loading' | 'ready' | 'error';

/** Loads coupons for this booking and applies one: server validation first, then the checkout
 * re-prices with it. Only one apply/remove runs at a time; `onDone` runs after a success. */
export function useApplyCoupon(
  session: CouponSession,
  onDone: (code: string | null) => void,
) {
  const {
    bookingType,
    amountMinor,
    apply: applyToCheckout,
    remove: removeFromCheckout,
  } = session;
  const [listState, setListState] = useState<CouponListState>('loading');
  const [listErrorKey, setListErrorKey] = useState('');
  const [offers, setOffers] = useState<CouponOffer[]>([]);
  const [input, setInputValue] = useState('');
  const [errorKey, setErrorKey] = useState('');
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const busy = useRef(false);

  const load = useCallback(async () => {
    setListState('loading');
    try {
      const { items } = await promoApi.available(bookingType, amountMinor);
      setOffers(sortOffers(items));
      setListState('ready');
    } catch (error) {
      setListErrorKey(couponErrorKey(error));
      setListState('error');
    }
  }, [bookingType, amountMinor]);

  useEffect(() => {
    load();
  }, [load]);

  const run = useCallback(
    async (code: string, task: () => Promise<void>, result: string | null) => {
      if (busy.current) return;
      busy.current = true;
      setPendingCode(code);
      setErrorKey('');
      try {
        await task();
        onDone(result);
      } catch (error) {
        setErrorKey(couponErrorKey(error));
      } finally {
        busy.current = false;
        setPendingCode(null);
      }
    },
    [onDone],
  );

  const apply = useCallback(
    async (raw: string) => {
      const code = normalizeCode(raw);
      if (!isValidCodeFormat(code)) {
        setErrorKey('coupons.invalidFormat');
        return;
      }
      await run(
        code,
        async () => {
          await promoApi.validate(code, bookingType, amountMinor);
          await applyToCheckout(code);
        },
        code,
      );
    },
    [amountMinor, applyToCheckout, bookingType, run],
  );

  const remove = useCallback(
    (code: string) => run(code, removeFromCheckout, null),
    [removeFromCheckout, run],
  );

  const setInput = useCallback((value: string) => {
    setInputValue(value);
    setErrorKey('');
  }, []);

  return {
    listState,
    listErrorKey,
    offers,
    input,
    setInput,
    errorKey,
    pendingCode,
    reload: load,
    apply,
    remove,
  };
}
