import { tr } from '@/services/i18n/tr';

const k = (key: string) => tr(`addRole.${key}`);

export const ADD_ROLE_STRINGS = {
  get workerTitle() {
    return k('workerTitle');
  },
  get workerSubtitle() {
    return k('workerSubtitle');
  },
  get businessTitle() {
    return k('businessTitle');
  },
  get businessSubtitle() {
    return k('businessSubtitle');
  },
  get nameLabel() {
    return k('nameLabel');
  },
  get namePlaceholder() {
    return k('namePlaceholder');
  },
  get ageLabel() {
    return k('ageLabel');
  },
  get agePlaceholder() {
    return k('agePlaceholder');
  },
  get businessNameLabel() {
    return k('businessNameLabel');
  },
  get businessNamePlaceholder() {
    return k('businessNamePlaceholder');
  },
  get contactNameLabel() {
    return k('contactNameLabel');
  },
  get contactNamePlaceholder() {
    return k('contactNamePlaceholder');
  },
  get addressLabel() {
    return k('addressLabel');
  },
  get addressPlaceholder() {
    return k('addressPlaceholder');
  },
  get useCurrent() {
    return k('useCurrent');
  },
  get locating() {
    return k('locating');
  },
  get workTypesLabel() {
    return k('workTypesLabel');
  },
  get businessTypesLabel() {
    return k('businessTypesLabel');
  },
  get pickOne() {
    return k('pickOne');
  },
  get loadingOptions() {
    return k('loadingOptions');
  },
  get submit() {
    return k('submit');
  },
  get required() {
    return k('required');
  },
  get ageInvalid() {
    return k('ageInvalid');
  },
  get addressShort() {
    return k('addressShort');
  },
  get failedTitle() {
    return k('failedTitle');
  },
};
