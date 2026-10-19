import type { Payout } from '@/types';

export type PayoutMonth = { id: string; label: string; payouts: Payout[] };

export const PAYOUT_MONTHS: PayoutMonth[] = [
  {
    id: 'oct-2026',
    label: 'October 2026',
    payouts: [
      {
        id: 'p-cafe-18',
        businessName: 'Third Wave Coffee',
        shiftTitle: 'Café service associate',
        dateLabel: '18 Oct',
        hours: 4,
        amount: 600,
        status: 'pending',
      },
      {
        id: 'p-event-12',
        businessName: 'The Park Events',
        shiftTitle: 'Event service associate',
        dateLabel: '12 Oct',
        hours: 8,
        amount: 1080,
        status: 'processing',
      },
      {
        id: 'p-cafe-16',
        businessName: 'Third Wave Coffee',
        shiftTitle: 'Café service associate',
        dateLabel: '16 Oct',
        hours: 4,
        amount: 600,
        status: 'completed',
      },
      {
        id: 'p-restock-14',
        businessName: 'Nature’s Basket',
        shiftTitle: 'Store restock associate',
        dateLabel: '14 Oct',
        hours: 5,
        amount: 700,
        status: 'completed',
      },
      {
        id: 'p-kitchen-10',
        businessName: 'Truffles',
        shiftTitle: 'Kitchen helper',
        dateLabel: '10 Oct',
        hours: 6,
        amount: 960,
        status: 'completed',
      },
      {
        id: 'p-banquet-04',
        businessName: 'The Oberoi',
        shiftTitle: 'Banquet server',
        dateLabel: '4 Oct',
        hours: 5,
        amount: 900,
        status: 'completed',
      },
    ],
  },
  {
    id: 'sep-2026',
    label: 'September 2026',
    payouts: [
      {
        id: 'p-promoter-27',
        businessName: 'Lenskart',
        shiftTitle: 'In-store promoter',
        dateLabel: '27 Sep',
        hours: 8,
        amount: 1160,
        status: 'completed',
      },
      {
        id: 'p-floor-20',
        businessName: 'Decathlon',
        shiftTitle: 'Floor assistant',
        dateLabel: '20 Sep',
        hours: 6,
        amount: 780,
        status: 'completed',
      },
    ],
  },
];
