import { create } from 'zustand';

import type { BusinessShiftDraft } from '@/types';

type BusinessShiftState = {
  draft: BusinessShiftDraft | null;
  postedShifts: BusinessShiftDraft[];
  saveDraft: (draft: BusinessShiftDraft) => void;
  postShift: (draft: BusinessShiftDraft) => BusinessShiftDraft;
};

export const useBusinessShiftStore = create<BusinessShiftState>(set => ({
  draft: null,
  postedShifts: [],
  saveDraft: draft =>
    set({
      draft: {
        ...draft,
        id: draft.seriesId ?? draft.id ?? `business-shift-draft-${Date.now()}`,
      },
    }),
  postShift: draft => {
    const seriesId =
      draft.seriesId ?? draft.id ?? `business-shift-${Date.now()}`;
    const posted = {
      ...draft,
      id: seriesId,
      seriesId,
    };
    set(state => ({
      draft: null,
      postedShifts: [
        ...state.postedShifts.filter(shift => shift.seriesId !== seriesId),
        ...posted.schedules.map(schedule => ({
          ...posted,
          id: `${seriesId}-${schedule.date}`,
          schedules: [schedule],
        })),
      ],
    }));
    return posted;
  },
}));
