import { BRAND } from '@/constants/brand';

export type TermsSection = { id: string; title: string; body: string };

export const TERMS_SECTIONS: TermsSection[] = [
  {
    id: 'using',
    title: 'Using KaaamNow',
    body: 'KaaamNow connects businesses with workers for short shifts. By creating an account you agree to these terms and to use the app lawfully.',
  },
  {
    id: 'accounts',
    title: 'Accounts and verification',
    body: 'You must give accurate details. Phone numbers are verified by OTP, and businesses may be asked for extra verification.',
  },
  {
    id: 'shifts',
    title: 'Shifts, payments and cancellations',
    body: 'Pay rates are shown before you accept a shift. Payments are released after check-out. Late cancellations may affect your rating.',
  },
  {
    id: 'ratings',
    title: 'Ratings and conduct',
    body: 'Businesses and workers rate each other after every shift. Harassment, fake check-ins or no-shows can lead to suspension.',
  },
  {
    id: 'privacy',
    title: 'Privacy and data',
    body: 'We use your location only to show nearby shifts and track check-in. See the Privacy Policy for details.',
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: `Questions about these terms? Write to ${BRAND.SUPPORT_EMAIL}.`,
  },
];
