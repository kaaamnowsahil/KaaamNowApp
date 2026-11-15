import { tr } from '@/services/i18n/tr';
import i18n from '@/services/i18n/i18n';

import { apiBaseUrl, AuthApiError } from './authApi';

export type SignupOption = {
  id: string;
  label: string;
  sortOrder: number;
  names?: Record<string, string>;
};

type LookupItem = {
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  names?: Record<string, string>;
};

function localizedName(item: LookupItem) {
  const code = (i18n.resolvedLanguage || i18n.language || 'en').split('-')[0] ?? 'en';
  return item.names?.[code] || item.name;
}

async function loadOptions(path: string): Promise<SignupOption[]> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new AuthApiError(
      tr('errors.signupOptionsUnreachable'),
      'network_error',
      0,
    );
  }
  if (!response.ok) {
    throw new AuthApiError(
      tr('errors.signupOptionsFailed'),
      'lookup_failed',
      response.status,
    );
  }
  const items = (await response.json()) as LookupItem[];
  return items
    .filter(item => item.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(item => ({
      id: item.slug,
      label: localizedName(item),
      names: item.names,
      sortOrder: item.sort_order,
    }));
}

export const loadWorkerSignupOptions = () => loadOptions('/work-categories');
export const loadBusinessSignupOptions = () => loadOptions('/business-types');
