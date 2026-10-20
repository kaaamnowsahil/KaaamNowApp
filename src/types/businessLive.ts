export type BusinessLiveRequestDraft = {
  role: string;
  category: string;
  responsibilities: string;
  requirement: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  workplaceInstructions: string;
  workers: string;
  hourlyRate: string;
  hours: string;
  startTime: string;
  searchRadiusKm: number;
  customPayAgreed: boolean;
};

export type BusinessLiveWorker = {
  id: string;
  name: string;
  category: string;
  rating: number;
  distanceKm: number;
  arrivalMinutes: number;
};

export type BusinessLiveRequest = {
  id: string;
  role: string;
  category: string;
  responsibilities: string;
  requirement: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  workplaceInstructions: string;
  workers: number;
  hourlyRate: number;
  hours: number;
  startTime: string;
  searchRadiusKm: number;
  customPayAgreed: boolean;
  status: 'finding' | 'partiallyAccepted' | 'accepted';
  acceptedWorkers: BusinessLiveWorker[];
  createdAt: number;
};
