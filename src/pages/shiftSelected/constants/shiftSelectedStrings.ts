import { tr } from '@/services/i18n/tr';
import type { Option } from '@/types';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`shiftSelected.${key}`, values);

export const SHIFT_SELECTED_STRINGS = {
  get HEADER_TITLE() {
    return tr('workerFlow.shiftSecured.headerTitle');
  },
  get HEADER_TAG() {
    return tr('workerFlow.checkIn.headerRight');
  },
  get OVERLINE() {
    return k('overline');
  },
  get HEADING() {
    return k('heading');
  },
  subtitle: (business: string, deadline: string) =>
    k('subtitle', { business, deadline }),
  business: (name: string, verified: boolean) =>
    verified ? k('businessVerified', { name }) : name,
  timeRange: (time: string, hours: number, note: string) =>
    k('timeRange', { time, count: hours, note }),
  get AGREED_RATE() {
    return k('agreedRate');
  },
  rate: (rate: string, total: string) => k('rate', { rate, total }),
  get WORKPLACE() {
    return k('workplace');
  },
  workplace: (place: string, km: number) =>
    k('workplaceDistance', { place, km }),
  get CONFIRM() {
    return k('confirm');
  },
  get DECLINE() {
    return k('decline');
  },
  get DECLINE_TITLE() {
    return k('declineTitle');
  },
  declineBody: (business: string) => k('declineBody', { business }),
  get DECLINE_REASON() {
    return k('declineReason');
  },
  get KEEP() {
    return k('keep');
  },
  get DECLINED_TITLE() {
    return k('declinedTitle');
  },
  get DECLINED_BODY() {
    return k('declinedBody');
  },
  get OK() {
    return k('ok');
  },
  get THE_DEADLINE() {
    return k('theDeadline');
  },
  breakNote: (minutes: number) =>
    minutes ? k('breakNote', { minutes }) : k('noBreak'),
  get CONFIRM_FAILED() {
    return k('confirmFailed');
  },
  get DECLINE_FAILED() {
    return k('declineFailed');
  },
};

export const DECLINE_REASONS: Option[] = [
  'busy',
  'another',
  'far',
  'pay',
  'other',
].map(id => ({
  id,
  get label() {
    return k(`declineReasons.${id}`);
  },
}));
