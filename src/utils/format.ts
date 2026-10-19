/** +919876543210 -> "+91 ••••• 43210" (Figma 1:137). */
export const maskIndianPhone = (e164: string): string => {
  const local = e164.replace(/^\+91/, '');
  return `+91 ••••• ${local.slice(-5)}`;
};

/** 272 -> "04:32" */
export const formatMmSs = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};
