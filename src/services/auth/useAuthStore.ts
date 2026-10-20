import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserRole } from '@/services/onboarding/useOnboardingStore';

type AuthState = {
  isAuth: boolean;
  phone: string | null;
  role: UserRole | null;
  hasHydrated: boolean;
  signIn: (session: { phone: string; role: UserRole }) => void;
  signOut: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      isAuth: false,
      phone: null,
      role: null,
      hasHydrated: false,
      signIn: ({ phone, role }) => set({ isAuth: true, phone, role }),
      signOut: () => set({ isAuth: false, phone: null, role: null }),
      setHasHydrated: hasHydrated => set({ hasHydrated }),
    }),
    {
      name: 'KaaamNow-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        isAuth: state.isAuth,
        phone: state.phone,
        role: state.role,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to restore the saved auth session.', error);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
