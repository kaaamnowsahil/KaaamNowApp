import * as Keychain from 'react-native-keychain';
import { create } from 'zustand';

import { AuthApiError, refreshAuthTokens } from './authApi';
import type { UserRole } from '@/services/onboarding/useOnboardingStore';

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

const AUTH_SERVICE = 'in.kaaamnow.app.auth';

type AuthState = {
  isAuth: boolean;
  phone: string | null;
  role: UserRole | null;
  tokens: AuthTokens | null;
  hasHydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (session: { phone: string; role: UserRole; tokens: AuthTokens }) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>(set => ({
  isAuth: false,
  phone: null,
  role: null,
  tokens: null,
  hasHydrated: false,
  hydrate: async () => {
    try {
      const saved = await Keychain.getGenericPassword({ service: AUTH_SERVICE });
      if (saved) {
        const session = JSON.parse(saved.password) as {
          phone: string;
          role: UserRole;
          tokens: AuthTokens;
        };
        if (session.phone && session.role && session.tokens?.refresh_token) {
          try {
            const tokens = await refreshAuthTokens(session.tokens.refresh_token);
            const refreshedSession = { ...session, tokens };
            await Keychain.setGenericPassword('session', JSON.stringify(refreshedSession), {
              service: AUTH_SERVICE,
            });
            set({ ...refreshedSession, isAuth: true });
          } catch (refreshError) {
            const isInvalidRefreshToken =
              refreshError instanceof AuthApiError &&
              [400, 401].includes(refreshError.status);
            if (isInvalidRefreshToken) {
              await Keychain.resetGenericPassword({ service: AUTH_SERVICE });
            } else {
              // Keep the existing session if the API is temporarily offline.
              set({ ...session, isAuth: true });
            }
          }
        }
      }
    } catch (error) {
      console.error('Could not restore the secure auth session.', error);
    } finally {
      set({ hasHydrated: true });
    }
  },
  signIn: async session => {
    const saved = await Keychain.setGenericPassword('session', JSON.stringify(session), {
      service: AUTH_SERVICE,
    });
    if (!saved) throw new Error('Secure session storage is unavailable.');
    set({ ...session, isAuth: true, hasHydrated: true });
  },
  signOut: async () => {
    try {
      await Keychain.resetGenericPassword({ service: AUTH_SERVICE });
    } finally {
      set({ isAuth: false, phone: null, role: null, tokens: null, hasHydrated: true });
    }
  },
}));
