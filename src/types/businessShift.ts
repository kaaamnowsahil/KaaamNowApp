export type BusinessShiftDraft = {
  id?: string;
  seriesId?: string;
  schedules: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
  hourlyRate: string;
  workers: string;
  responsibilities: string;
  role: string;
  location: string;
};
