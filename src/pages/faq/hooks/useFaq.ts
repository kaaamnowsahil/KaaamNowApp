import { useEffect, useState } from 'react';
import { Linking } from 'react-native';

import { useAuthStore } from '@/services/auth/useAuthStore';
import { fetchFaqs, type FaqItem } from '@/services/content/contentApi';

import { FAQ_STRINGS } from '../constants';

export const useFaq = () => {
  const role = useAuthStore(state => state.role);
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [supportEmails, setSupportEmails] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchFaqs(role)
      .then(response => {
        if (!active) return;
        setFaqs(response.items);
        setOpenId(response.items[0]?.id ?? null);
        setSupportEmails(
          response.support_emails.length
            ? response.support_emails
            : [response.support_email].filter(Boolean),
        );
        setFailed(false);
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [role]);

  const needle = query.trim().toLowerCase();
  const items = needle
    ? faqs.filter(
        item =>
          item.question.toLowerCase().includes(needle) ||
          item.answer.toLowerCase().includes(needle),
      )
    : faqs;

  return {
    isLoading,
    query,
    setQuery,
    items,
    emptyMessage: failed ? FAQ_STRINGS.LOAD_ERROR : faqs.length ? FAQ_STRINGS.NO_RESULTS : FAQ_STRINGS.EMPTY,
    openId,
    toggle: (id: string) => setOpenId(prev => (prev === id ? null : id)),
    canContactSupport: supportEmails.length > 0,
    contactSupport: () =>
      Linking.openURL(
        `mailto:${supportEmails.join(',')}?subject=${encodeURIComponent(
          FAQ_STRINGS.MAIL_SUBJECT,
        )}`,
      ),
  };
};
