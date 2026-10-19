import { create } from 'zustand';

import type { UserRole } from '@/services/onboarding/useOnboardingStore';

type AuthState = {
  isAuth: boolean;
  phone: string | null;
  role: UserRole | null;
  signIn: (session: { phone: string; role: UserRole }) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>(set => ({
  isAuth: false,
  phone: null,
  role: null,
  signIn: ({ phone, role }) => set({ isAuth: true, phone, role }),
  signOut: () => set({ isAuth: false, phone: null, role: null }),
}));
