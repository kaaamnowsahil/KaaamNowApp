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
  shiftList: 'ShiftList',
  notifications: 'Notifications',
  editProfile: 'EditProfile',
  language: 'Language',
  appearance: 'Appearance',
  offline: 'Offline',
  payoutAccount: 'PayoutAccount',
  earningsHistory: 'EarningsHistory',
  workerEarningDetail: 'WorkerEarningDetail',
  withdraw: 'Withdraw',
  withdrawSuccess: 'WithdrawSuccess',

  // shift flow (worker): live and scheduled share request + details
  shiftRequest: 'ShiftRequest',
  shiftDetails: 'ShiftDetails',
  applicationSubmitted: 'ApplicationSubmitted',
  shiftSelected: 'ShiftSelected',
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
  businessEditProfile: 'BusinessEditProfile',
  businessShiftSchedule: 'BusinessShiftSchedule',
  businessShiftReview: 'BusinessShiftReview',
  businessShiftPosted: 'BusinessShiftPosted',
  businessLiveCreate: 'BusinessLiveCreate',
  businessLiveReview: 'BusinessLiveReview',
  businessLiveFinding: 'BusinessLiveFinding',
  businessLiveStaffing: 'BusinessLiveStaffing',
  businessLiveAccepted: 'BusinessLiveAccepted',
  businessLiveTracking: 'BusinessLiveTracking',
  businessLivePayment: 'BusinessLivePayment',
  businessPaymentMethod: 'BusinessPaymentMethod',
  businessPaymentScan: 'BusinessPaymentScan',
  businessPaymentSuccess: 'BusinessPaymentSuccess',
  businessPaymentHistory: 'BusinessPaymentHistory',
  businessPaymentDetail: 'BusinessPaymentDetail',
  businessScheduledWorkerTracking: 'BusinessScheduledWorkerTracking',
  businessRateWorker: 'BusinessRateWorker',
  businessApplicantProfile: 'BusinessApplicantProfile',
  businessRoster: 'BusinessRoster',

  // common (both stacks)
  terms: 'Terms',
  faq: 'Faq',
} as const;
