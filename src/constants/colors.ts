/**
 * Single source for all app colors, taken from the KaamNow Figma file (qtCoCV096jOWdNxpfqBquH).
 * Add values only as they are read from Figma frames; do not invent new ones.
 */
export type ThemeColors = {
  background: string;
  surface: string;
  border: string;
  /** Icon-button outline (back-button 1:131). */
  outline: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  onPrimary: string;
};

/** Light frames (Splash 1:10, Welcome back 1:39, Verify 1:120) */
export const LIGHT_COLORS: ThemeColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  outline: 'rgba(11, 16, 32, 0.22)',
  text: '#0B1020',
  textMuted: '#475569',
  textSubtle: '#64748B',
  primary: '#8B5CF6',
  onPrimary: '#FFFFFF',
};

/** Dark frames (Splash 1:23, Welcome back 1:78, Verify 1:152) */
export const DARK_COLORS: ThemeColors = {
  background: '#0B1020',
  surface: '#171F35',
  border: '#29334B',
  outline: 'rgba(248, 250, 252, 0.22)',
  text: '#F8FAFC',
  textMuted: '#A7B0C4',
  textSubtle: '#7C879F',
  primary: '#8B5CF6',
  onPrimary: '#FFFFFF',
};
