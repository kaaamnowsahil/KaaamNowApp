export const WITHDRAW_STRINGS = {
  TITLE: 'Withdraw',
  AVAILABLE: 'Available to withdraw',
  fromShifts: (n: number) =>
    `Earnings from ${n} completed ${n === 1 ? 'shift' : 'shifts'}`,
  WITHDRAW_TO: 'WITHDRAW TO',
  PAYOUT_TIME: 'Payouts reach you within 24 hours',
  withdraw: (amount: string) => `Withdraw ${amount}`,
  CONTINUE: 'Continue',
} as const;
