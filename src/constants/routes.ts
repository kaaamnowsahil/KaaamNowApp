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

  // bottom tabs — worker
  workerHome: 'WorkerHome',
  workerShifts: 'WorkerShifts',
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
