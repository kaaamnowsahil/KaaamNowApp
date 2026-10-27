const critical = [
  'src/services/promos/couponLogic.ts',
  'src/services/promos/promoApi.ts',
  'src/services/promos/useCouponSession.ts',
  'src/services/liveWork/livePrice.ts',
  'src/services/i18n/localeChecks.ts',
  'src/pages/applyCoupon/*.{ts,tsx}',
  'src/components/coupon/*.tsx',
  'src/services/earnings/*.ts',
  'src/pages/withdraw/WithdrawPage.tsx',
  'src/pages/withdraw/hooks/*.ts',
  'src/pages/withdraw/components/*.tsx',
  'src/pages/withdrawSuccess/WithdrawSuccessPage.tsx',
  'src/pages/payoutAccount/**/*.{ts,tsx}',
  'src/services/notifications/*.ts',
  'src/pages/notifications/NotificationsPage.tsx',
  'src/services/push/pushService.ts',
];

const perFile = { statements: 95, branches: 95, functions: 95, lines: 95 };

module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: critical,
  coverageReporters: ['text', 'json-summary'],
  coverageThreshold: Object.fromEntries(
    critical.map(path => [`./${path}`, perFile]),
  ),
};
