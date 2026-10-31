import { localizedRecord, tr } from '@/services/i18n/tr';

import { formatMinutes } from './liveWorkFormat';

export const BUSINESS_LIVE_STATUS = localizedRecord('liveWork.businessStatus');
export const WORKER_LIVE_STATUS = localizedRecord('liveWork.workerStatus');

const k = (key: string, values?: Record<string, unknown>) =>
  tr(`liveWork.${key}`, values);

export const LIVE_TEXT = {
  get postTitle() {
    return k('postTitle');
  },
  get termsLink() {
    return k('termsLink');
  },
  get cancelReason() {
    return k('cancelReason');
  },
  get reviewTitle() {
    return k('reviewTitle');
  },
  get trackTitle() {
    return k('trackTitle');
  },
  get modeTag() {
    return k('modeTag');
  },
  get category() {
    return k('category');
  },
  get categoryPlaceholder() {
    return k('categoryPlaceholder');
  },
  get searchCategory() {
    return k('searchCategory');
  },
  get noMatches() {
    return k('noMatches');
  },
  get categoriesFailed() {
    return k('categoriesFailed');
  },
  get retry() {
    return k('retry');
  },
  get jobTitle() {
    return k('jobTitle');
  },
  get jobTitlePlaceholder() {
    return k('jobTitlePlaceholder');
  },
  get description() {
    return k('description');
  },
  get address() {
    return k('address');
  },
  get useCurrent() {
    return k('useCurrent');
  },
  get locating() {
    return k('locating');
  },
  get locationDenied() {
    return k('locationDenied');
  },
  get instructions() {
    return k('instructions');
  },
  get siteContact() {
    return k('siteContact');
  },
  get duration() {
    return k('duration');
  },
  get rate() {
    return k('rate');
  },
  get continue() {
    return k('continue');
  },
  get edit() {
    return k('edit');
  },
  availableWorkers: (count: number, km: number) =>
    k('availableWorkers', { count, km }),
  noAvailableWorkers: (km: number) => k('noAvailableWorkers', { km }),
  get availabilityUnknown() {
    return k('availabilityUnknown');
  },
  get priceTitle() {
    return k('priceTitle');
  },
  baseLine: (rate: string, duration: string) =>
    k('baseLine', { rate, duration }),
  couponLine: (code: string) => k('couponLine', { code }),
  commissionLine: (pct: string) => k('commissionLine', { pct }),
  get gatewayLine() {
    return k('gatewayLine');
  },
  get total() {
    return k('total');
  },
  get reservedNote() {
    return k('reservedNote');
  },
  extensionNote: (rate: string, pct: string) =>
    k('extensionNote', { rate, pct }),
  get terms() {
    return k('terms');
  },
  get termsRequired() {
    return k('termsRequired');
  },
  postAndPay: (amount: string) => k('postAndPay', { amount }),
  get priceChanged() {
    return k('priceChanged');
  },
  payNow: (amount: string) => k('payNow', { amount }),
  get payPending() {
    return k('payPending');
  },
  get paymentNotCompleted() {
    return k('paymentNotCompleted');
  },
  get searching() {
    return k('searching');
  },
  searchTimeLeft: (clock: string) => k('searchTimeLeft', { clock }),
  notified: (count: number) => k('notified', { count }),
  get noWorkers() {
    return k('noWorkers');
  },
  get repost() {
    return k('repost');
  },
  get arrivalCodeTitle() {
    return k('arrivalCodeTitle');
  },
  get arrivalCodeHint() {
    return k('arrivalCodeHint');
  },
  get arrivalCodeLocked() {
    return k('arrivalCodeLocked');
  },
  get arrivalCodeExpired() {
    return k('arrivalCodeExpired');
  },
  get reissueCode() {
    return k('reissueCode');
  },
  get workerProfile() {
    return k('workerProfile');
  },
  rating: (avg: number | null, count: number) =>
    avg === null || !count
      ? k('ratingNew')
      : k('rating', { avg: avg.toFixed(1), count }),
  completedJobs: (count: number) => k('completedJobs', { count }),
  distance: (km: number) => k('distance', { km: km.toFixed(1) }),
  locationAge: (seconds: number) =>
    seconds < 60
      ? k('locationAgeSeconds', { count: seconds })
      : k('locationAgeMinutes', { count: Math.round(seconds / 60) }),
  get locationStale() {
    return k('locationStale');
  },
  get locationUnavailable() {
    return k('locationUnavailable');
  },
  get workerLeft() {
    return k('workerLeft');
  },
  get timeLeft() {
    return k('timeLeft');
  },
  extendedBy: (minutes: number) =>
    k('extendedBy', { duration: formatMinutes(minutes) }),
  get extend() {
    return k('extend');
  },
  get extendBody() {
    return k('extendBody');
  },
  get sendExtension() {
    return k('sendExtension');
  },
  extensionRequested: (minutes: number) =>
    k('extensionRequested', { duration: formatMinutes(minutes) }),
  extensionAccepted: (minutes: number, amount: string) =>
    k('extensionAccepted', { duration: formatMinutes(minutes), amount }),
  get extensionDeclined() {
    return k('extensionDeclined');
  },
  get withdrawExtension() {
    return k('withdrawExtension');
  },
  get extOriginal() {
    return k('extOriginal');
  },
  get extAdditional() {
    return k('extAdditional');
  },
  get extBaseRate() {
    return k('extBaseRate');
  },
  get extSurcharge() {
    return k('extSurcharge');
  },
  get extRate() {
    return k('extRate');
  },
  get extBase() {
    return k('extBase');
  },
  get extPay() {
    return k('extPay');
  },
  get extRevisedDuration() {
    return k('extRevisedDuration');
  },
  get extRevisedTotal() {
    return k('extRevisedTotal');
  },
  get endWork() {
    return k('endWork');
  },
  get endTitle() {
    return k('endTitle');
  },
  get endBody() {
    return k('endBody');
  },
  get cancel() {
    return k('cancel');
  },
  get cancelTitle() {
    return k('cancelTitle');
  },
  get keep() {
    return k('keep');
  },
  feeLine: (fee: string) => k('feeLine', { fee }),
  refundLine: (amount: string) => k('refundLine', { amount }),
  retainedLine: (amount: string) => k('retainedLine', { amount }),
  workerCompLine: (amount: string) => k('workerCompLine', { amount }),
  get finalBill() {
    return k('finalBill');
  },
  get paid() {
    return k('paid');
  },
  get refunds() {
    return k('refunds');
  },
  refundStatus: localizedRecord('liveWork.refundStatus'),
  refundReason: localizedRecord('liveWork.refundReason'),
  cancelledBy: localizedRecord('liveWork.cancelledBy'),
  get workersLabel() {
    return k('workersLabel');
  },
  get workersFewer() {
    return k('workersFewer');
  },
  get workersMore() {
    return k('workersMore');
  },
  get workersHint() {
    return k('workersHint');
  },
  perWorkerTotal: (each: string, count: number, total: string) =>
    k('perWorkerTotal', { each, count, total }),
  workersFound: (filled: number, required: number) =>
    k('workersFound', { filled, required }),
  workerOfCount: (count: number) => k('workerOfCount', { count }),
  unfilledRefunded: (amount: string) => k('unfilledRefunded', { amount }),
  get cancelThisWorker() {
    return k('cancelThisWorker');
  },
  get cancelWorkerTitle() {
    return k('cancelWorkerTitle');
  },
  get postRest() {
    return k('postRest');
  },
  workerNumber: (n: number) => k('workerNumber', { n }),
  get offline() {
    return k('offline');
  },
  get actionFailed() {
    return k('actionFailed');
  },
  get myLiveWork() {
    return k('myLiveWork');
  },
  get openLiveWork() {
    return k('openLiveWork');
  },
  get workerTag() {
    return k('workerTag');
  },
  get requestsTitle() {
    return k('requestsTitle');
  },
  get noRequests() {
    return k('noRequests');
  },
  youEarn: (amount: string) => k('youEarn', { amount }),
  respondWithin: (clock: string) => k('respondWithin', { clock }),
  get accept() {
    return k('accept');
  },
  get decline() {
    return k('decline');
  },
  get taken() {
    return k('taken');
  },
  get needLocation() {
    return k('needLocation');
  },
  get activeJob() {
    return k('activeJob');
  },
  get open() {
    return k('open');
  },
  get startTravel() {
    return k('startTravel');
  },
  get sharingLocation() {
    return k('sharingLocation');
  },
  get workerLocationOff() {
    return k('workerLocationOff');
  },
  get shareLocationTitle() {
    return k('shareLocationTitle');
  },
  get openSettings() {
    return k('openSettings');
  },
  get notNow() {
    return k('notNow');
  },
  get directions() {
    return k('directions');
  },
  get enterCode() {
    return k('enterCode');
  },
  codeLength: (n: number) => k('codeLength', { n }),
  get startWork() {
    return k('startWork');
  },
  attemptsLeft: (count: number) => k('attemptsLeft', { count }),
  get reached() {
    return k('reached');
  },
  notReached: (distance: string) => k('notReached', { distance }),
  get codeLocked() {
    return k('codeLocked');
  },
  get completeWork() {
    return k('completeWork');
  },
  get completeTitle() {
    return k('completeTitle');
  },
  get completeBody() {
    return k('completeBody');
  },
  get workerCancelTitle() {
    return k('workerCancelTitle');
  },
  get keepWorking() {
    return k('keepWorking');
  },
  extensionAsk: (minutes: number, amount: string) =>
    k('extensionAsk', { duration: formatMinutes(minutes), amount }),
  get acceptExtension() {
    return k('acceptExtension');
  },
  get earnings() {
    return k('earnings');
  },
  earningsLine: (net: string) => k('earningsLine', { net }),
  extensionEarnings: (amount: string) => k('extensionEarnings', { amount }),
  get totalEarnings() {
    return k('totalEarnings');
  },
  waiting: (count: number) => k('waiting', { count }),
  get forceCancel() {
    return k('forceCancel');
  },
  get forceCancelTitle() {
    return k('forceCancelTitle');
  },
  cancelStage: localizedRecord('liveWork.cancelStage'),
  workerCancelStage: localizedRecord('liveWork.workerCancelStage'),
  get doneHintHourly() {
    return k('doneHintHourly');
  },
  get doneHintTask() {
    return k('doneHintTask');
  },
  get workerDoneHint() {
    return k('workerDoneHint');
  },
  get businessStopped() {
    return k('businessStopped');
  },
  finalEarned: (net: string) => k('finalEarned', { net }),
  get finalNotPaid() {
    return k('finalNotPaid');
  },
};
