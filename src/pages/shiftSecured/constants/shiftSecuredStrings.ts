import { tr } from '@/services/i18n/tr';
import type { Option } from '@/types';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`shiftSecured.${key}`, values);

export const SHIFT_SECURED_STRINGS = {
  ARRIVE_MINUTES_EARLY: 10,
  get SHIFT_LEAD() {
    return k('shiftLead');
  },
  lateCancelWindow: (hours: number) => k('lateCancelWindow', { count: hours }),
  get CANCEL_FAILED() {
    return k('cancelFailed');
  },
  get PREVIEW_FAILED() {
    return k('previewFailed');
  },
  get FREE_CANCEL() {
    return k('freeCancel');
  },
  feeCancel: (fee: string, strikes: number) =>
    strikes > 0
      ? k('feeCancelStrikes', { fee, count: strikes })
      : k('feeCancel', { fee }),
  get EMERGENCY() {
    return k('emergency');
  },
};

export const CANCEL_REASONS: Option[] = [
  'sick',
  'emergency',
  'transport',
  'clash',
  'mistake',
  'other',
].map(id => ({
  id,
  get label() {
    return k(`reasons.${id}`);
  },
}));
