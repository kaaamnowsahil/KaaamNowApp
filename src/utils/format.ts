/** +919876543210 -> "+91 ••••• 43210" (Figma 1:137). */
export const maskIndianPhone = (e164: string): string => {
  const local = e164.replace(/^\+91/, '');
  return `+91 ••••• ${local.slice(-5)}`;
};

/** 1050 -> "₹1,050" */
export const formatRupees = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

/** 272 -> "04:32" */
export const formatMmSs = (totalSeconds: number): string => {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(
    s % 60,
  ).padStart(2, '0')}`;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

/** 8048 → "02:14:08" */
export const formatClock = (totalSeconds: number) =>
  [
    Math.floor(totalSeconds / 3600),
    Math.floor((totalSeconds % 3600) / 60),
    totalSeconds % 60,
  ]
    .map(pad2)
    .join(':');

/** 299 → "04:59" */
export const formatMinSec = (totalSeconds: number) =>
  `${pad2(Math.floor(totalSeconds / 60))}:${pad2(totalSeconds % 60)}`;

/** "14:00–18:00" → { start: "14:00", end: "18:00" } */
export const splitTimeRange = (timeLabel: string) => {
  const [start = timeLabel, end = ''] = timeLabel.split(/\s*[–-]\s*/);
  return { start, end };
};

/** "Aarav Sharma" → "AS" (first two words). */
export const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');
