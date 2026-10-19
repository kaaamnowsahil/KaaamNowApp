export type PayoutOption = {
  id: string;
  /** Letter shown in the tile; otherwise an add icon. */
  initial?: string;
  addKind?: 'upi' | 'bank';
  title: string;
  caption: string;
  /** Saved accounts only: where the money goes and how. */
  destination?: string;
  method?: string;
};

export const BALANCE = {
  available: 4850,
  completedShifts: 12,
};

export const PAYOUT_OPTIONS: PayoutOption[] = [
  {
    id: 'upi',
    initial: 'G',
    title: 'UPI ID',
    caption: 'aarav@okbank',
    destination: 'aarav@okbank',
    method: 'UPI',
  },
  {
    id: 'paytm',
    initial: 'P',
    title: 'Paytm',
    caption: 'Linked to your phone number',
    destination: '+91 ••••• 43210',
    method: 'Paytm',
  },
  {
    id: 'bank',
    initial: 'A',
    title: 'Bank account',
    caption: 'HDFC ••4821',
    destination: 'HDFC ••4821',
    method: 'Bank',
  },
  {
    id: 'add-upi',
    addKind: 'upi',
    title: 'Add new UPI ID',
    caption: 'Link another account',
  },
  {
    id: 'add-bank',
    addKind: 'bank',
    title: 'Add bank account',
    caption: 'Account number & IFSC',
  },
];

export const DEFAULT_OPTION_ID = 'upi';

/** The API returns this after the request is accepted. */
export const MOCK_REFERENCE = 'WD-20931';
