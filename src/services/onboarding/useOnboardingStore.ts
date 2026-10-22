import { create } from 'zustand';

export type UserRole = 'worker' | 'business';

export type GeoPoint = { lat: number; lng: number };

export type WorkerSignup = {
  fullName: string;
  phone: string;
  email?: string;
  age: number;
  address: string;
  location?: GeoPoint;
  workTypes: string[];
  /** Kept in memory only until server-side registration completes. */
  password: string;
};

export type BusinessSignup = {
  businessName: string;
  contactName: string;
  phone: string;
  email?: string;
  address: string;
  location?: GeoPoint;
  businessType: string;
  /** Kept in memory only until server-side registration completes. */
  password?: string;
};

type OnboardingState = {
  role: UserRole | null;
  worker: WorkerSignup | null;
  business: BusinessSignup | null;
  setRole: (role: UserRole) => void;
  setWorker: (worker: WorkerSignup) => void;
  setBusiness: (business: BusinessSignup) => void;
  clearSignup: () => void;
};

/** Sign-up details held until the phone is verified and the account is created. */
export const useOnboardingStore = create<OnboardingState>(set => ({
  role: null,
  worker: null,
  business: null,
  setRole: role => set({ role }),
  setWorker: worker => set({ worker }),
  setBusiness: business => set({ business }),
  clearSignup: () => set({ role: null, worker: null, business: null }),
}));
