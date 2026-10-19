import type { Shift } from './shift';

export type BookingStatus =
  | 'confirmed'
  | 'selected'
  | 'applied'
  | 'completed'
  | 'cancelled';

/** A worker's relationship to one shift. */
export type Booking = {
  id: string;
  status: BookingStatus;
  shift: Shift;
  /** Shown to the business on arrival; confirmed bookings only. */
  checkInCode?: string;
  /** Selected offers only, e.g. "20 Oct, 18:00". */
  confirmBy?: string;
  /** True when the shift is today (shown under "Today"). */
  isToday?: boolean;
  /** Business rating out of 5, completed bookings only. */
  ratingGiven?: number;
};

/** Result of a withdrawal request (12 · Withdrawal initiated). */
export type WithdrawalReceipt = {
  amount: number;
  /** UPI id, wallet or masked bank account, e.g. "aarav@okbank". */
  destination: string;
  /** e.g. "UPI", "Paytm", "Bank" */
  method: string;
  reference: string;
};

export type PayoutStatus = 'pending' | 'processing' | 'completed';

export type Payout = {
  id: string;
  businessName: string;
  shiftTitle: string;
  dateLabel: string;
  hours: number;
  amount: number;
  status: PayoutStatus;
};
