import { create } from 'zustand';

import type { BookingType } from './promoApi';

/** What the checkout hands to the Apply Coupon screen. Functions stay out of navigation params. */
export type CouponSession = {
  bookingType: BookingType;
  /** Work amount (worker pay before fees) in paise; null while it isn't known. */
  amountMinor: number | null;
  appliedCode: string | null;
  /** Re-price the checkout with this code on the server; reject to show why it failed. */
  apply: (code: string) => Promise<void>;
  remove: () => Promise<void>;
};

type CouponSessionState = {
  session: CouponSession | null;
  start: (session: CouponSession) => void;
  setApplied: (code: string | null) => void;
  end: () => void;
};

export const useCouponSession = create<CouponSessionState>(set => ({
  session: null,
  start: session => set({ session }),
  setApplied: code =>
    set(state =>
      state.session
        ? { session: { ...state.session, appliedCode: code } }
        : state,
    ),
  end: () => set({ session: null }),
}));
