import { apiBaseUrl } from '@/services/auth/authApi';
import type { UserRole } from '@/services/onboarding/useOnboardingStore';

export type FaqItem = {
  id: string;
  slug?: string | null;
  question: string;
  answer: string;
};

export type FaqList = {
  items: FaqItem[];
  support_email: string;
  support_emails: string[];
};

export type ContentSection = { id: string; title: string; body: string };

export type ContentPage = {
  slug: string;
  audience: string;
  title: string;
  body_markdown: string;
  sections?: ContentSection[];
  effective_date: string;
  updated_at: string;
};

const REQUEST_TIMEOUT_MS = 15000;

export class ContentRequestError extends Error {
  constructor(readonly status: number) {
    super(`Content request failed (${status})`);
  }
}

async function getContent<T>(path: string, role: UserRole | null): Promise<T> {
  const query = role ? `?audience=${role}` : '';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const response = await fetch(`${apiBaseUrl}${path}${query}`, {
    headers: { Accept: 'application/json' },
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));
  if (!response.ok) throw new ContentRequestError(response.status);
  return (await response.json()) as T;
}

export const fetchFaqs = (role: UserRole | null) =>
  getContent<FaqList>('/content/faqs', role);

export const fetchTerms = (role: UserRole | null) =>
  getContent<ContentPage>('/content/terms', role);
