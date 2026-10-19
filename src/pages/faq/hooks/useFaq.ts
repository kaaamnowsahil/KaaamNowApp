import { useState } from 'react';
import { Linking } from 'react-native';

import { BRAND } from '@/constants/brand';
import { useMockLoading } from '@/shared/hooks/useMockLoading';

import { FAQ_STRINGS as S } from '../constants';
import { DEFAULT_OPEN_ID, FAQ_ITEMS } from '../mock';

export const useFaq = () => {
  const isLoading = useMockLoading();
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(DEFAULT_OPEN_ID);

  const needle = query.trim().toLowerCase();
  const items = needle
    ? FAQ_ITEMS.filter(
        item =>
          item.question.toLowerCase().includes(needle) ||
          item.answer.toLowerCase().includes(needle),
      )
    : FAQ_ITEMS;

  return {
    isLoading,
    query,
    setQuery,
    items,
    openId,
    toggle: (id: string) => setOpenId(prev => (prev === id ? null : id)),
    contactSupport: () =>
      Linking.openURL(
        `mailto:${BRAND.SUPPORT_EMAIL}?subject=${encodeURIComponent(
          S.MAIL_SUBJECT,
        )}`,
      ),
  };
};
