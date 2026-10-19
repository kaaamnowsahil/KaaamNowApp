export type FaqItem = { id: string; question: string; answer: string };

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'paid',
    question: 'How do I get paid?',
    answer:
      'After you check out, the business confirms the shift and your earnings are sent to your UPI or bank account within 24 hours.',
  },
  {
    id: 'cancel',
    question: 'How do I cancel a shift?',
    answer:
      'Open the shift from My shifts and tap Cancel shift. Cancelling less than 2 hours before start may affect your rating.',
  },
  {
    id: 'check-in',
    question: 'How does check-in work?',
    answer:
      'When you reach the venue, open the shift and tap Check in. We confirm you are within 200 m of the business location.',
  },
  {
    id: 'no-show',
    question: "What if the business doesn't show up?",
    answer:
      'Wait 15 minutes after the start time, then report it from the shift screen. You will still be paid the minimum call-out amount.',
  },
  {
    id: 'ratings',
    question: 'How are ratings calculated?',
    answer:
      'Your rating is the average of business ratings from your last 50 shifts. On-time check-ins and completed shifts raise it.',
  },
];

export const DEFAULT_OPEN_ID = 'paid';
