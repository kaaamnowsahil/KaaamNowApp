export type ShiftExtraDetails = {
  about: string;
  bring: string[];
  managerName: string;
  address: string;
  breakInfo: string;
};

/** Extra details per shift id, beyond what the shift card already carries. */
export const SHIFT_DETAILS: Record<string, ShiftExtraDetails> = {
  'shift-cafe-service': {
    about:
      'Take orders at the counter, serve coffee and snacks to tables and keep the seating area clean during the afternoon rush.',
    bring: ['Black t-shirt', 'Closed shoes', 'Aadhaar or any ID'],
    managerName: 'Riya (store manager)',
    address: '80 Feet Rd, 4th Block, Koramangala',
    breakInfo: '15 min break · free coffee',
  },
  'shift-event-service': {
    about:
      'Serve guests at a corporate lunch: set tables, serve food and clear plates. Training is given 30 minutes before the start.',
    bring: ['White shirt', 'Black trousers', 'Formal shoes'],
    managerName: 'Karan (event lead)',
    address: '100 Feet Rd, Indiranagar',
    breakInfo: '30 min break · lunch provided',
  },
};

export const DEFAULT_DETAILS: ShiftExtraDetails = {
  about:
    'Help the team with day-to-day work during the shift. The manager will brief you on arrival.',
  bring: ['Any government ID', 'Comfortable shoes'],
  managerName: 'Shift manager',
  address: '',
  breakInfo: 'Break as per business policy',
};
