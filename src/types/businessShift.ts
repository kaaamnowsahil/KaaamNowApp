export type BusinessShiftDraft = {
  id?: string;
  seriesId?: string;
  sameForEveryDate?: boolean;
  schedules: {
    date: string;
    startTime: string;
    endTime: string;
    role: string;
    category: string;
    requirement: string;
    responsibilities: string;
    workers: string;
    hourlyRate: string;
  }[];
  hourlyRate: string;
  workers: string;
  responsibilities: string;
  requirement: string;
  role: string;
  category: string;
  location: string;
};
