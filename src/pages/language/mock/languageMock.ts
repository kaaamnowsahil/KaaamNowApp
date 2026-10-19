import type { Option } from '@/types';

/** label is shown in the list; caption is the language name in English. */
export const LANGUAGES: (Option & { caption: string })[] = [
  { id: 'en', label: 'English', caption: 'English' },
  { id: 'hi', label: 'हिन्दी', caption: 'Hindi' },
  { id: 'kn', label: 'ಕನ್ನಡ', caption: 'Kannada' },
  { id: 'ta', label: 'தமிழ்', caption: 'Tamil' },
  { id: 'te', label: 'తెలుగు', caption: 'Telugu' },
  { id: 'mr', label: 'मराठी', caption: 'Marathi' },
  { id: 'bn', label: 'বাংলা', caption: 'Bengali' },
];
