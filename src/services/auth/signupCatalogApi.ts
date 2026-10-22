import { apiBaseUrl, AuthApiError } from './authApi';

export type SignupOption = { id: string; label: string; sortOrder: number };

type LookupItem = {
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

async function loadOptions(path: string): Promise<SignupOption[]> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    throw new AuthApiError(
      'Could not load signup options. Check your connection and try again.',
      'network_error',
      0,
    );
  }
  if (!response.ok) {
    throw new AuthApiError(
      'Could not load signup options. Please try again.',
      'lookup_failed',
      response.status,
    );
  }
  const items = (await response.json()) as LookupItem[];
  return items
    .filter(item => item.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(item => ({ id: item.slug, label: item.name, sortOrder: item.sort_order }));
}

export const loadWorkerSignupOptions = () => loadOptions('/work-categories');
export const loadBusinessSignupOptions = () => loadOptions('/business-types');
