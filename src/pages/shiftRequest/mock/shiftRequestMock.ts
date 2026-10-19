import { BRAND } from '@/constants/brand';
import type { ShiftStatus } from '@/types';

export type RequestMeta = {
  sender: string;
  senderInitial: string;
  sentAt: string;
  /** Badge on the shift card, e.g. "Now" / "Open". */
  badge: string;
  payNote: string;
  /** Live only: seconds to respond before it goes to the next worker. */
  expiresInSeconds: number;
};

const BASE = {
  sender: BRAND.NAME,
  senderInitial: BRAND.NAME.charAt(0),
  payNote: 'paid after the shift',
};

export const REQUEST_META: Record<ShiftStatus, RequestMeta> = {
  live: { ...BASE, sentAt: 'now', badge: 'Now', expiresInSeconds: 299 },
  scheduled: { ...BASE, sentAt: '2 min ago', badge: 'Open', expiresInSeconds: 0 },
};
