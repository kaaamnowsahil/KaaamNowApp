import type { Shift } from './shift';

export type BookingStatus =
  | 'confirmed'
  | 'selected'
  | 'applied'
  | 'completed'
  | 'cancelled';

/** My shifts also lists applications that ended before a booking. */
export type MyShiftStatus = BookingStatus | 'declined' | 'rejected' | 'withdrawn' | 'expired';

/** A worker's relationship to one shift. */
export type Booking = {
  id: string;
  status: MyShiftStatus;
  shift: Shift;
  /** Shown to the business on arrival; confirmed bookings only. */
  checkInCode?: string;
  /** Selected offers only, e.g. "20 Oct, 18:00". */
  confirmBy?: string;
  /** True when the shift is today (shown under "Today"). */
  isToday?: boolean;
  /** Business rating out of 5, completed bookings only. */
  ratingGiven?: number;
  /** Last status change, e.g. "26 Oct, 12:27"; key picks the label (applied, confirmed…). */
  statusTime?: { key: string; at: string };
  /** Earned or estimated pay in rupees. */
  estimatedPay?: number;
  businessRating?: { avg: number; count: number };
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

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PayoutMethod = 'UPI' | 'Paytm' | 'Bank';

export type Payout = {
  id: string;
  businessName: string;
  shiftTitle: string;
  dateLabel: string;
  hours: number;
  amount: number;
  status: PayoutStatus;
  reference?: string;
  method?: PayoutMethod;
  /** UPI id, wallet number or masked bank account. */
  destination?: string;
  requestedAt?: string;
  processedAt?: string;
  failureReason?: string;
};

export type WorkerEarningDetails = {
  id: string;
  title: string;
  amount: number;
  status: PayoutStatus;
  reference?: string;
  method?: PayoutMethod;
  /** UPI id, wallet number or masked bank account. */
  destination?: string;
  requestedAt?: string;
  processedAt?: string;
  failureReason?: string;
  businessName?: string;
  dateLabel?: string;
  hours?: number;
  rate?: number;
  shifts?: number;
};
