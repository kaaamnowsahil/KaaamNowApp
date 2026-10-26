import { apiBaseUrl } from '@/services/auth/authApi';
import type { Option } from '@/types';

import { apiRequest } from './apiClient';

/** Local media is served from the API host root (e.g. /media/avatars/x.jpg). */
export const mediaUrl = (url: string | null | undefined) => {
  if (!url) return null;
  if (/^https?:\/\//.test(url)) return url;
  return `${apiBaseUrl.replace(/\/api\/v\d+\/?$/, '')}${url}`;
};

export type MyWorkerProfile = {
  id: string;
  full_name: string;
  photo_url: string | null;
  phone: string;
  address_text: string | null;
  locality: string | null;
  latitude: number | null;
  longitude: number | null;
  category_slugs: string[];
  is_available: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  rating_avg: number;
  rating_count: number;
};

export type MyBusinessProfile = {
  id: string;
  business_name: string;
  logo_url: string | null;
  phone: string;
  verification_status: string;
  address_text: string | null;
  locality: string | null;
  latitude: number | null;
  longitude: number | null;
  business_type_slugs: string[];
  rating_avg: number;
  rating_count: number;
};

export type MyAccount = {
  phone: string;
  full_name: string;
  photo_url: string | null;
  language_code: string;
  theme_preference: 'system' | 'light' | 'dark';
};

export type MyProfileResponse = {
  profile_type: string;
  account: MyAccount;
  worker?: MyWorkerProfile | null;
  business?: MyBusinessProfile | null;
};

export type ProfilePatch = {
  full_name?: string;
  language_code?: string;
  theme_preference?: 'system' | 'light' | 'dark';
  business_name?: string;
  business_type_slugs?: string[];
  category_slugs?: string[];
  address_text?: string;
  latitude?: number;
  longitude?: number;
};

export type PickedImage = { uri: string; type: string; fileName: string };

type LookupItem = {
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

const toOptions = (items: LookupItem[]): Option[] =>
  items
    .filter(item => item.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(item => ({ id: item.slug, label: item.name }));

export const meApi = {
  profile: () => apiRequest<MyProfileResponse>('GET', '/me/profile'),
  updateProfile: (body: ProfilePatch) =>
    apiRequest<MyProfileResponse>('PATCH', '/me/profile', { body }),
  /** Worker photo or the primary Business / Work logo. */
  uploadProfileImage: (image: PickedImage) => {
    const form = new FormData();
    form.append('file', {
      uri: image.uri,
      type: image.type,
      name: image.fileName,
    } as never);
    return apiRequest<MyProfileResponse>('POST', '/me/profile/image', {
      body: form,
    });
  },
  workCategories: async () =>
    toOptions(await apiRequest<LookupItem[]>('GET', '/work-categories')),
  businessTypes: async () =>
    toOptions(await apiRequest<LookupItem[]>('GET', '/business-types')),
};
