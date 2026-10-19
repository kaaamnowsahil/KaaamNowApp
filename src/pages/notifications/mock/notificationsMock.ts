export type AppNotification = {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  isUnread: boolean;
};

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-confirmed',
    title: 'Shift confirmed',
    body: 'Third Wave Coffee confirmed your café shift today at 14:00. Check-in code: 4821.',
    timeLabel: '10 min ago',
    isUnread: true,
  },
  {
    id: 'n-new-nearby',
    title: '3 new shifts near Koramangala',
    body: 'Hospitality and retail shifts paying up to ₹175 / hour.',
    timeLabel: '1 h ago',
    isUnread: true,
  },
  {
    id: 'n-paid',
    title: 'Payment sent',
    body: '₹960 from Truffles was sent to aarav@okaxis.',
    timeLabel: 'Yesterday',
    isUnread: false,
  },
  {
    id: 'n-rate',
    title: 'How was your shift?',
    body: 'Rate The Oberoi to help other workers.',
    timeLabel: '2 days ago',
    isUnread: false,
  },
];
