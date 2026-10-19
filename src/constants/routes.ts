/** Screen route names — use these instead of string literals. */
export const ROUTES = {
  // before login
  welcome: 'Welcome',
  verifyPhone: 'VerifyPhone',
  roleSelect: 'RoleSelect',
  workerSignup: 'WorkerSignup',
  businessSignup: 'BusinessSignup',

  // after login
  mainTabs: 'MainTabs',
  shiftDetails: 'ShiftDetails',
  shiftList: 'ShiftList',
  notifications: 'Notifications',
  editProfile: 'EditProfile',
  language: 'Language',
  payoutAccount: 'PayoutAccount',
  earningsHistory: 'EarningsHistory',

  // live shift flow (worker)
  liveRequest: 'LiveRequest',
  liveDetails: 'LiveDetails',
  shiftSecured: 'ShiftSecured',
  shiftTravel: 'ShiftTravel',
  shiftCheckIn: 'ShiftCheckIn',
  activeShift: 'ActiveShift',
  finishShift: 'FinishShift',
  shiftComplete: 'ShiftComplete',
  rateBusiness: 'RateBusiness',

  // bottom tabs — worker
  workerHome: 'WorkerHome',
  workerShifts: 'WorkerShifts',
  workerEarnings: 'WorkerEarnings',
  workerProfile: 'WorkerProfile',

  // bottom tabs — business
  businessLive: 'BusinessLive',
  businessShifts: 'BusinessShifts',
  businessApplicants: 'BusinessApplicants',
  businessProfile: 'BusinessProfile',

  // common (both stacks)
  terms: 'Terms',
  faq: 'Faq',
} as const;
