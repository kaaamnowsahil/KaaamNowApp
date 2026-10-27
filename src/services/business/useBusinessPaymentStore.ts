import { create } from 'zustand';

export type BusinessWorkerRating = {
  workerId: string;
  rating: number;
  tags: string[];
  comment: string;
  createdAt: number;
};

type BusinessPaymentState = {
  workerRatings: BusinessWorkerRating[];
  rateWorker: (rating: BusinessWorkerRating) => void;
};

export const useBusinessPaymentStore = create<BusinessPaymentState>(set => ({
  workerRatings: [],
  rateWorker: rating =>
    set(state => ({
      workerRatings: [
        rating,
        ...state.workerRatings.filter(
          item => item.workerId !== rating.workerId,
        ),
      ],
    })),
}));
