/**
 * Single source for all app colors, taken from the KaamNow Figma file (qtCoCV096jOWdNxpfqBquH).
 * Add values only as they are read from Figma frames; do not invent new ones.
 */
export type ThemeColors = {
  background: string;
  surface: string;
  /** Filled input / unselected chip (Edit profile 17:178, 17:204). */
  fill: string;
  border: string;
  /** Icon-button outline (back-button 1:131). */
  outline: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  primary: string;
  onPrimary: string;
  /** "Verified" label (17:190). */
  success: string;
  /** "Selected · Confirmation needed", Pending / Processing (My shifts, Earnings 08). */
  warning: string;
  /** Avatar + settings icon tiles (Profile 17:2 / 17:518). */
  primarySoft: string;
  /** Log out label and icon (Profile 17:2). */
  danger: string;
  dangerSoft: string;
};

/** Light frames (Splash 1:10, Welcome 1:39, Verify 1:120, Edit profile 17:152) */
export const LIGHT_COLORS: ThemeColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  fill: '#F8FAFC',
  border: '#E2E8F0',
  outline: 'rgba(11, 16, 32, 0.22)',
  text: '#0B1020',
  textMuted: '#475569',
  textSubtle: '#64748B',
  primary: '#8B5CF6',
  onPrimary: '#FFFFFF',
  success: '#16A34A',
  warning: '#D97706',
  primarySoft: '#F5F3FF',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
};

/** Dark frames (Splash 1:23, Welcome 1:78, Verify 1:152, Edit profile 17:668) */
export const DARK_COLORS: ThemeColors = {
  background: '#0B1020',
  surface: '#171F35',
  fill: '#171F35',
  border: '#29334B',
  outline: 'rgba(248, 250, 252, 0.22)',
  text: '#F8FAFC',
  textMuted: '#A7B0C4',
  textSubtle: '#7C879F',
  primary: '#8B5CF6',
  onPrimary: '#FFFFFF',
  success: '#16A34A',
  warning: '#F59E0B',
  primarySoft: '#261F48',
  danger: '#DC2626',
  dangerSoft: '#451B1F',
};
