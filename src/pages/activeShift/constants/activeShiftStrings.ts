import { tr } from '@/services/i18n/tr';

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`workerFlow.activeShift.${key}`, values);

export const ACTIVE_SHIFT_STRINGS = {
  get END_EARLY() {
    return k('endEarly');
  },
  get EMERGENCY() {
    return k('emergency');
  },
  endsAt: (time: string, extra: number) =>
    extra > 0 ? k('endsAtExtra', { time, extra }) : time,
  extensionTitle: (minutes: number) => k('extensionTitle', { minutes }),
  get EXTENSION_BODY() {
    return k('extensionBody');
  },
  get ACCEPT() {
    return k('acceptExtra');
  },
  get DECLINE() {
    return k('decline');
  },
  get EXTENSION_FAILED() {
    return k('extensionFailed');
  },
  pinForBusiness: (pin: string) => k('pinForBusiness', { pin }),
  get PIN_TITLE() {
    return k('pinTitle');
  },
  get PIN_BODY() {
    return k('pinBody');
  },
  get PIN_CONFIRM() {
    return k('pinConfirm');
  },
  get PIN_CLOSE() {
    return k('pinClose');
  },
  get END_FAILED() {
    return k('endFailed');
  },
  get ENDED_TITLE() {
    return k('endedTitle');
  },
  get ENDED_BODY() {
    return k('endedBody');
  },
  get OK() {
    return k('ok');
  },
};
