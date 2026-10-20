import { create } from 'zustand';

import type {
  BusinessLiveRequest,
  BusinessLiveRequestDraft,
  BusinessLiveWorker,
} from '@/types';

type BusinessLiveState = {
  draft: BusinessLiveRequestDraft | null;
  activeRequest: BusinessLiveRequest | null;
  saveDraft: (draft: BusinessLiveRequestDraft) => void;
  publishRequest: (draft: BusinessLiveRequestDraft) => BusinessLiveRequest;
  acceptWorkers: (workers: BusinessLiveWorker[]) => void;
  resumeFinding: () => void;
  cancelRequest: () => void;
};

export const useBusinessLiveStore = create<BusinessLiveState>(set => ({
  draft: null,
  activeRequest: null,
  saveDraft: draft => set({ draft }),
  publishRequest: draft => {
    const request: BusinessLiveRequest = {
      id: `live-request-${Date.now()}`,
      role: draft.role.trim(),
      category: draft.category.trim(),
      responsibilities: draft.responsibilities.trim(),
      requirement: draft.requirement.trim(),
      location: draft.location.trim(),
      latitude: draft.latitude,
      longitude: draft.longitude,
      workplaceInstructions: draft.workplaceInstructions.trim(),
      workers: Number(draft.workers),
      hourlyRate: Number(draft.hourlyRate),
      hours: Number(draft.hours),
      startTime: draft.startTime.trim(),
      searchRadiusKm: draft.searchRadiusKm,
      customPayAgreed: draft.customPayAgreed,
      status: 'finding',
      acceptedWorkers: [],
      createdAt: Date.now(),
    };
    set({ draft: null, activeRequest: request });
    return request;
  },
  acceptWorkers: workers =>
    set(state => {
      const request = state.activeRequest;
      if (!request) return state;
      const existingIds = new Set(
        request.acceptedWorkers.map(worker => worker.id),
      );
      const acceptedWorkers = [
        ...request.acceptedWorkers,
        ...workers.filter(worker => !existingIds.has(worker.id)),
      ].slice(0, request.workers);
      return {
        activeRequest: {
          ...request,
          acceptedWorkers,
          status:
            acceptedWorkers.length >= request.workers
              ? 'accepted'
              : 'partiallyAccepted',
        },
      };
    }),
  resumeFinding: () =>
    set(state => {
      const request = state.activeRequest;
      if (!request || request.acceptedWorkers.length >= request.workers) {
        return state;
      }
      return {
        activeRequest: {
          ...request,
          status: 'finding',
          createdAt: Date.now(),
        },
      };
    }),
  cancelRequest: () => set({ activeRequest: null }),
}));
