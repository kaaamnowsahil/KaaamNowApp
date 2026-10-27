import { tr } from '@/services/i18n/tr';

const k = (key: string) => tr(`faq.${key}`);

export const FAQ_STRINGS = {
  get TITLE() {
    return k('title');
  },
  get SEARCH_PLACEHOLDER() {
    return k('searchPlaceholder');
  },
  get NO_RESULTS() {
    return k('noResults');
  },
  get EMPTY() {
    return k('empty');
  },
  get LOAD_ERROR() {
    return k('loadError');
  },
  get HELP_TITLE() {
    return k('helpTitle');
  },
  get HELP_CAPTION() {
    return k('helpCaption');
  },
  get CONTACT() {
    return k('contact');
  },
  get MAIL_SUBJECT() {
    return k('mailSubject');
  },
};
