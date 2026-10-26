import * as Keychain from 'react-native-keychain';
import { create } from 'zustand';

import { unregisterPush } from '@/services/push/pushService';

import type { UserRole } from '@/services/onboarding/useOnboardingStore';

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

const AUTH_SERVICE = 'in.kaaamnow.app.auth';

let hydrating: Promise<void> | null = null;

type AuthState = {
  isAuth: boolean;
  phone: string | null;
  role: UserRole | null;
  tokens: AuthTokens | null;
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (session: { phone: string; role: UserRole; tokens: AuthTokens }) => Promise<void>;
  signOut: () => Promise<void>;
  setRole: (role: UserRole) => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuth: false,
  phone: null,
  role: null,
  tokens: null,
  hasHydrated: false,
  hydrate: () => {
    // Expired access tokens are refreshed by apiClient on the first 401, through its
    // single shared refresh; refreshing here too races it and trips reuse detection.
    hydrating ??= (async () => {
      try {
        const saved = await Keychain.getGenericPassword({ service: AUTH_SERVICE });
        if (saved && !get().isAuth) {
          const session = JSON.parse(saved.password) as {
            phone: string;
            role: UserRole;
            tokens: AuthTokens;
          };
          if (session.phone && session.role && session.tokens?.refresh_token) {
            set({ ...session, isAuth: true });
          }
        }
      } catch (error) {
        console.error('Could not restore the secure auth session.', error);
      } finally {
        set({ hasHydrated: true });
      }
    })();
    return hydrating;
  },
  signIn: async session => {
    const saved = await Keychain.setGenericPassword('session', JSON.stringify(session), {
      service: AUTH_SERVICE,
    });
    if (!saved) throw new Error('Secure session storage is unavailable.');
    set({ ...session, isAuth: true, hasHydrated: true });
  },
  signOut: async () => {
    await unregisterPush().catch(() => undefined);
    try {
      await Keychain.resetGenericPassword({ service: AUTH_SERVICE });
    } finally {
      set({ isAuth: false, phone: null, role: null, tokens: null, hasHydrated: true });
    }
  },
  setRole: async role => {
    const { phone, tokens } = get();
    if (phone && tokens) {
      await Keychain.setGenericPassword('session', JSON.stringify({ phone, role, tokens }), {
        service: AUTH_SERVICE,
      });
    }
    set({ role });
  },
}));
