import type { Option } from '@/types';

/** label is the native name; caption is the language name in English. */
export const LANGUAGES: (Option & { caption: string })[] = [
  { id: 'en', label: 'English', caption: 'English' },
  { id: 'hi', label: 'हिन्दी', caption: 'Hindi' },
  { id: 'ta', label: 'தமிழ்', caption: 'Tamil' },
  { id: 'te', label: 'తెలుగు', caption: 'Telugu' },
  { id: 'kn', label: 'ಕನ್ನಡ', caption: 'Kannada' },
  { id: 'ml', label: 'മലയാളം', caption: 'Malayalam' },
  { id: 'mr', label: 'मराठी', caption: 'Marathi' },
  { id: 'bn', label: 'বাংলা', caption: 'Bengali' },
  { id: 'gu', label: 'ગુજરાતી', caption: 'Gujarati' },
  { id: 'pa', label: 'ਪੰਜਾਬੀ', caption: 'Punjabi' },
  { id: 'or', label: 'ଓଡ଼ିଆ', caption: 'Odia' },
  { id: 'ur', label: 'اردو', caption: 'Urdu' },
];
