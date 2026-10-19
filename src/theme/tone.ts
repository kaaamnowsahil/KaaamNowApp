import type { ThemeColors } from '@/constants/colors';

/** Semantic accent used by overlines, badges, status icons and values. */
export type Tone = 'default' | 'primary' | 'success' | 'warning' | 'danger';

export const toneColor = (colors: ThemeColors, tone: Tone): string =>
  tone === 'default' ? colors.text : colors[tone];
