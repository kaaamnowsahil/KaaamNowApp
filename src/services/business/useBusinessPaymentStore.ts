import { create } from 'zustand';

import type { BusinessPaymentRecord } from '@/types';

export type BusinessWorkerRating = {
  workerId: string;
  rating: number;
  tags: string[];
  comment: string;
  createdAt: number;
};

type BusinessPaymentState = {
  records: BusinessPaymentRecord[];
  reachedWorkerIds: string[];
  completedWorkerIds: string[];
  paidWorkerIds: string[];
  workerRatings: BusinessWorkerRating[];
  addRecord: (record: BusinessPaymentRecord) => void;
  markWorkerReached: (workerId: string) => void;
  markWorkerCompleted: (workerId: string) => void;
  markWorkerPaid: (workerId: string) => void;
  rateWorker: (rating: BusinessWorkerRating) => void;
};

export const useBusinessPaymentStore = create<BusinessPaymentState>(set => ({
  records: [],
  reachedWorkerIds: [],
  completedWorkerIds: [],
  paidWorkerIds: [],
  workerRatings: [],
  addRecord: record =>
    set(state => ({
      records: [record, ...state.records.filter(item => item.id !== record.id)],
    })),
  markWorkerReached: workerId =>
    set(state => ({
      reachedWorkerIds: state.reachedWorkerIds.includes(workerId)
        ? state.reachedWorkerIds
        : [...state.reachedWorkerIds, workerId],
    })),
  markWorkerCompleted: workerId =>
    set(state => ({
      reachedWorkerIds: state.reachedWorkerIds.includes(workerId)
        ? state.reachedWorkerIds
        : [...state.reachedWorkerIds, workerId],
      completedWorkerIds: state.completedWorkerIds.includes(workerId)
        ? state.completedWorkerIds
        : [...state.completedWorkerIds, workerId],
    })),
  markWorkerPaid: workerId =>
    set(state => ({
      paidWorkerIds: state.paidWorkerIds.includes(workerId)
        ? state.paidWorkerIds
        : [...state.paidWorkerIds, workerId],
    })),
  rateWorker: rating =>
    set(state => ({
      workerRatings: [
        rating,
        ...state.workerRatings.filter(item => item.workerId !== rating.workerId),
      ],
    })),
}));
