import { useEffect, useState } from 'react';

import { useAuthStore } from '@/services/auth/useAuthStore';
import {
  ContentRequestError,
  fetchTerms,
  type ContentSection,
} from '@/services/content/contentApi';

import { TERMS_STRINGS } from '../constants';

type TermsState = {
  lastUpdated: string | null;
  sections: ContentSection[];
  isLoading: boolean;
  emptyMessage: string | null;
};

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const useTerms = (): TermsState => {
  const role = useAuthStore(state => state.role);
  const [state, setState] = useState<TermsState>({
    lastUpdated: null,
    sections: [],
    isLoading: true,
    emptyMessage: null,
  });

  useEffect(() => {
    let active = true;
    fetchTerms(role)
      .then(page => {
        if (!active) return;
        setState({
          lastUpdated: TERMS_STRINGS.lastUpdated(formatDate(page.effective_date)),
          sections: page.sections?.length
            ? page.sections
            : [{ id: page.slug, title: page.title, body: page.body_markdown }],
          isLoading: false,
          emptyMessage: null,
        });
      })
      .catch(error => {
        if (!active) return;
        const notPublished =
          error instanceof ContentRequestError && error.status === 404;
        setState({
          lastUpdated: null,
          sections: [],
          isLoading: false,
          emptyMessage: notPublished ? TERMS_STRINGS.EMPTY : TERMS_STRINGS.LOAD_ERROR,
        });
      });
    return () => {
      active = false;
    };
  }, [role]);

  return state;
};
