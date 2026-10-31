import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { CouponRow } from '@/components/coupon/CouponRow';
import { PricingModeRadio } from '@/components/taskPricing/PricingModeRadio';
import { TermsCheckbox } from '@/components/shiftFlow';
import {
  PrimaryButton,
  SecondaryButton,
  TextButton,
} from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { ApiError } from '@/services/api/apiClient';
import {
  loadWorkerSignupOptions,
  type SignupOption,
} from '@/services/auth/signupCatalogApi';
import {
  payInvoice,
  PaymentNotCompletedError,
} from '@/services/billing/billingApi';
import {
  bookingTotal,
  createRequest,
  quoteRequest,
} from '@/services/liveWork/livePrice';
import { liveWorkApi } from '@/services/liveWork/liveWorkApi';
import {
  formatMinutes,
  formatRupees,
  liveErrorText,
  newIdempotencyKey,
  repostForm,
  serverFieldErrors,
  validateLiveWorkForm,
  type LiveWorkForm,
  type LiveWorkFormErrors,
} from '@/services/liveWork/liveWorkFormat';
import { LIVE_TEXT as S } from '@/services/liveWork/liveWorkStrings';
import type {
  LiveAvailableWorkers,
  LivePriceBreakdown,
} from '@/services/liveWork/liveWorkTypes';
import { getDevicePosition } from '@/services/maps/devicePosition';
import { termsApi } from '@/services/terms/termsApi';
import {
  couponErrorKey,
  isCouponRejected,
} from '@/services/promos/couponLogic';
import { useCouponSession } from '@/services/promos/useCouponSession';
import { geocodeAddress, reverseGeocode } from '@/services/maps/googleMaps';
import type { AppScreenProps, PickedAddress } from '@/types';

import {
  ShiftFormField,
  ShiftLocationCard,
  ShiftSelectField,
} from '../businessShiftCreate/components';
import { AvailableWorkersMap } from './components/AvailableWorkersMap';
import { LiveRulesCard } from './components/LiveRulesCard';
import {
  LiveCard,
  LivePriceBreakdownCard,
  LiveText,
  WorkerCountStepper,
} from './components/LiveWorkUi';

const AVAILABLE_REFRESH_MS = 30_000;

const EMPTY_FORM: LiveWorkForm = {
  categorySlug: '',
  jobTitle: '',
  description: '',
  address: '',
  latitude: null,
  longitude: null,
  instructions: '',
  siteContact: '',
  pricingMode: 'hourly',
  durationMinutes: 120,
  rate: '',
  taskPrice: '',
  workers: 1,
};
/** Business: category, details, location, duration and rate → server price → post & pay. */
export const BusinessLiveWorkPostPage: FC<
  AppScreenProps<typeof ROUTES.businessLiveWorkPost>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const startCouponSession = useCouponSession(state => state.start);
  const repost = route.params?.repost;
  const [form, setForm] = useState<LiveWorkForm>(() =>
    repost ? repostForm(repost) : EMPTY_FORM,
  );
  const [durationHours, setDurationHours] = useState(() =>
    String((repost ? repostForm(repost) : EMPTY_FORM).durationMinutes / 60),
  );
  const [errors, setErrors] = useState<LiveWorkFormErrors>({});
  const [categories, setCategories] = useState<SignupOption[]>([]);
  const [categoriesError, setCategoriesError] = useState('');
  const [locating, setLocating] = useState(false);
  const [locationNote, setLocationNote] = useState('');
  const [available, setAvailable] = useState<LiveAvailableWorkers | null>(null);
  const availabilityText = available
    ? available.count
      ? S.availableWorkers(available.count, available.radius_km)
      : S.noAvailableWorkers(available.radius_km)
    : S.availabilityUnknown;
  const [quote, setQuote] = useState<LivePriceBreakdown | null>(null);
  const [maxWorkers, setMaxWorkers] = useState<number | null>(null);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const idempotencyKey = useRef(newIdempotencyKey());
  const addressEdited = useRef(false);

  const loadCategories = useCallback(() => {
    setCategoriesError('');
    loadWorkerSignupOptions()
      .then(setCategories)
      .catch(error => setCategoriesError(liveErrorText(error)));
  }, []);
  useEffect(loadCategories, [loadCategories]);

  const locateDevice = useCallback(async () => {
    setLocating(true);
    setLocationNote('');
    const position = await getDevicePosition();
    if (!position) {
      setLocating(false);
      setLocationNote(S.locationDenied);
      return;
    }
    addressEdited.current = false;
    setForm(current => ({ ...current, ...position }));
    setErrors(current => ({ ...current, address: undefined }));
    const address = await reverseGeocode(position).catch(() => null);
    setForm(current => ({
      ...current,
      address:
        address ??
        `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`,
    }));
    setLocating(false);
  }, []);
  const hasRepostLocation =
    repost?.work.latitude != null && repost.work.longitude != null;
  useEffect(() => {
    if (hasRepostLocation) return;
    locateDevice().catch(() => setLocating(false));
  }, [hasRepostLocation, locateDevice]);

  const pickLocation = (picked: PickedAddress) => {
    addressEdited.current = false;
    setLocationNote('');
    setForm(current => ({
      ...current,
      address: picked.address,
      latitude: picked.lat,
      longitude: picked.lng,
    }));
    setErrors(current => ({ ...current, address: undefined }));
  };

  const pinOnMap = async (latitude: number, longitude: number) => {
    addressEdited.current = false;
    setLocationNote('');
    setForm(current => ({ ...current, latitude, longitude }));
    setErrors(current => ({ ...current, address: undefined }));
    setLocating(true);
    const address = await reverseGeocode({ latitude, longitude }).catch(
      () => null,
    );
    if (address) setForm(current => ({ ...current, address }));
    setLocating(false);
  };

  useEffect(() => {
    const address = form.address.trim();
    if (!addressEdited.current || address.length < 3) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      geocodeAddress(address, controller.signal)
        .then(point => {
          if (point) setForm(current => ({ ...current, ...point }));
        })
        .catch(() => undefined);
    }, 700);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.address]);

  useEffect(() => {
    if (form.latitude === null || form.longitude === null) {
      setAvailable(null);
      return;
    }
    let cancelled = false;
    const refresh = () =>
      liveWorkApi
        .availableWorkers({
          lat: form.latitude as number,
          lng: form.longitude as number,
          category: form.categorySlug || undefined,
        })
        .then(next => !cancelled && setAvailable(next))
        .catch(() => !cancelled && setAvailable(null));
    const timer = setTimeout(() => {
      refresh().catch(() => undefined);
    }, 400);
    const poll = setInterval(() => {
      refresh().catch(() => undefined);
    }, AVAILABLE_REFRESH_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(poll);
    };
  }, [form.latitude, form.longitude, form.categorySlug]);

  const set = <K extends keyof LiveWorkForm>(
    key: K,
    value: LiveWorkForm[K],
  ) => {
    if (key === 'address') {
      addressEdited.current = true;
      setForm(current => ({
        ...current,
        address: value as string,
        latitude: null,
        longitude: null,
      }));
    } else {
      setForm(current => ({ ...current, [key]: value }));
    }
    setErrors(current => ({ ...current, [key]: undefined }));
  };

  const showError = (error: unknown) => {
    const fields = serverFieldErrors(error);
    if (Object.keys(fields).length) {
      setErrors(fields);
      if (!fields.terms) setQuote(null);
      return;
    }
    Alert.alert(S.actionFailed, liveErrorText(error));
  };

  const fetchQuote = async (code: string | null) => {
    const next = await liveWorkApi.quote(quoteRequest(form, code));
    if (next.max_workers) setMaxWorkers(next.max_workers);
    return next;
  };

  /** A coupon the server no longer accepts is dropped and the price shown without it. */
  const dropCoupon = async (error: unknown) => {
    setPromoCode(null);
    Alert.alert(t('coupons.removedTitle'), t(couponErrorKey(error)));
    setQuote(await fetchQuote(null));
  };

  const review = async (code: string | null = promoCode) => {
    const found = validateLiveWorkForm(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      try {
        setQuote(await fetchQuote(code));
      } catch (error) {
        if (!code || !isCouponRejected(error)) throw error;
        await dropCoupon(error);
      }
      setAcceptTerms(false);
    } catch (error) {
      showError(error);
    } finally {
      setBusy(false);
    }
  };

  const openCoupons = (current: LivePriceBreakdown) => {
    startCouponSession({
      bookingType: 'live',
      amountMinor: current.base_amount_minor,
      appliedCode: current.promo_code,
      apply: async code => {
        setQuote(await fetchQuote(code));
        setPromoCode(code);
      },
      remove: async () => {
        setQuote(await fetchQuote(null));
        setPromoCode(null);
      },
    });
    navigation.navigate(ROUTES.applyCoupon);
  };

  const removeCoupon = () => {
    setBusy(true);
    fetchQuote(null)
      .then(next => {
        setQuote(next);
        setPromoCode(null);
      })
      .catch(showError)
      .finally(() => setBusy(false));
  };

  const postAndPay = async (termsRecorded = false): Promise<void> => {
    if (!quote) return;
    if (!acceptTerms) {
      setErrors({ terms: S.termsRequired });
      return;
    }
    setBusy(true);
    let bookingId: string | null = null;
    try {
      const booking = await liveWorkApi.create(
        createRequest(form, quote, idempotencyKey.current),
      );
      bookingId = booking.booking_id;
      if (booking.deposit_invoice && booking.actions.can_pay) {
        await payInvoice(booking.deposit_invoice.id);
      }
      navigation.replace(ROUTES.businessLiveWork, {
        bookingId: booking.booking_id,
      });
    } catch (error) {
      if (bookingId) {
        navigation.replace(ROUTES.businessLiveWork, { bookingId });
        Alert.alert(
          S.paymentNotCompleted,
          error instanceof PaymentNotCompletedError
            ? `${error.message} ${S.payPending}`
            : liveErrorText(error),
        );
        return;
      }
      if (
        error instanceof ApiError &&
        error.code === 'terms_required' &&
        !termsRecorded
      ) {
        await termsApi
          .accept('business')
          .then(() => postAndPay(true), showError);
      } else if (error instanceof ApiError && error.code === 'price_changed') {
        idempotencyKey.current = newIdempotencyKey();
        Alert.alert(S.priceChanged, liveErrorText(error));
        setQuote(null);
      } else if (isCouponRejected(error)) {
        idempotencyKey.current = newIdempotencyKey();
        await dropCoupon(error).catch(showError);
      } else {
        showError(error);
      }
    } finally {
      setBusy(false);
    }
  };

  if (quote) {
    return (
      <FormScreen
        onBack={() => setQuote(null)}
        title={S.reviewTitle}
        headerTag={S.modeTag}
        gap={14}
        busy={busy}
        testID="business-live-work-review"
        actions={
          <>
            <PrimaryButton
              label={S.postAndPay(formatRupees(bookingTotal(quote)))}
              onPress={() => postAndPay()}
              disabled={busy}
              testID="business-live-work-post"
            />
            <SecondaryButton
              label={S.edit}
              onPress={() => setQuote(null)}
              disabled={busy}
            />
          </>
        }
      >
        <LiveCard testID="business-live-work-summary">
          <LiveText tone="title">{form.jobTitle.trim()}</LiveText>
          <LiveText tone="muted">
            {categories.find(c => c.id === form.categorySlug)?.label} ·{' '}
            {quote.pricing_mode === 'task'
              ? t('taskPricing.fixedPrice')
              : formatMinutes(form.durationMinutes)}
          </LiveText>
          <LiveText tone="muted">{form.address}</LiveText>
        </LiveCard>
        <LivePriceBreakdownCard price={quote} />
        <CouponRow
          appliedCode={quote.promo_code}
          savedMinor={quote.promo_discount_minor}
          disabled={busy}
          onOpen={() => openCoupons(quote)}
          onRemove={removeCoupon}
        />
        <LiveRulesCard
          audience="business"
          isTask={quote.pricing_mode === 'task'}
          onReadTerms={() => navigation.navigate(ROUTES.terms)}
        />
        <TermsCheckbox
          checked={acceptTerms}
          onToggle={() => {
            setAcceptTerms(value => !value);
            setErrors({});
          }}
          label={S.terms}
          linkLabel={S.termsLink}
          onReadTerms={() => navigation.navigate(ROUTES.terms)}
          error={errors.terms}
          testID="business-live-work-terms"
        />
      </FormScreen>
    );
  }

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={S.postTitle}
      headerTag={S.modeTag}
      gap={14}
      busy={busy}
      testID="business-live-work-post-page"
      actions={
        <PrimaryButton
          label={S.continue}
          onPress={() => review()}
          disabled={busy || locating}
          testID="business-live-work-review-price"
        />
      }
    >
      {categoriesError ? (
        <View style={styles.stack}>
          <LiveText tone="danger">{`${S.categoriesFailed} ${categoriesError}`}</LiveText>
          <TextButton label={S.retry} onPress={loadCategories} />
        </View>
      ) : (
        <ShiftSelectField
          label={S.category}
          value={form.categorySlug}
          placeholder={S.categoryPlaceholder}
          options={categories}
          onChange={id => set('categorySlug', id)}
          searchPlaceholder={S.searchCategory}
          error={errors.categorySlug}
          testID="business-live-work-category"
        />
      )}
      <ShiftFormField
        label={S.jobTitle}
        value={form.jobTitle}
        onChangeText={value => set('jobTitle', value)}
        placeholder={S.jobTitlePlaceholder}
        maxLength={120}
        error={errors.jobTitle}
        testID="business-live-work-title"
      />
      <ShiftFormField
        label={S.description}
        value={form.description}
        onChangeText={value => set('description', value)}
        multiline
        textAlignVertical="top"
        style={styles.multiline}
        maxLength={4000}
        error={errors.description}
      />
      <ShiftLocationCard
        address={form.address}
        latitude={form.latitude}
        longitude={form.longitude}
        isGeocoding={locating}
        onAddressChange={value => set('address', value)}
        onPicked={pickLocation}
        onMapPick={pinOnMap}
        error={errors.address || locationNote || undefined}
      />
      <LiveText tone="muted" testID="business-live-work-available">
        {availabilityText}
      </LiveText>
      {available && form.latitude !== null && form.longitude !== null ? (
        <AvailableWorkersMap
          label={availabilityText}
          latitude={form.latitude}
          longitude={form.longitude}
          radiusKm={available.radius_km}
          workers={available.workers ?? []}
        />
      ) : null}
      <ShiftFormField
        label={S.instructions}
        value={form.instructions}
        onChangeText={value => set('instructions', value)}
        maxLength={2000}
      />
      <ShiftFormField
        label={S.siteContact}
        value={form.siteContact}
        onChangeText={value => set('siteContact', value)}
        maxLength={120}
      />
      <WorkerCountStepper
        value={form.workers ?? 1}
        max={maxWorkers}
        disabled={busy}
        error={errors.workers}
        onChange={value => set('workers', Math.max(1, value))}
      />
      <PricingModeRadio
        value={form.pricingMode}
        onChange={mode => set('pricingMode', mode)}
        disabled={busy}
        testID="business-live-work-pricing"
      />
      {form.pricingMode === 'task' ? (
        <>
          <ShiftFormField
            label={t('taskPricing.taskPriceLabel')}
            value={form.taskPrice}
            onChangeText={value =>
              set('taskPrice', value.replace(/[^\d.]/g, ''))
            }
            keyboardType="decimal-pad"
            prefix="₹"
            placeholder={t('taskPricing.taskPricePlaceholder')}
            error={errors.taskPrice}
            testID="business-live-work-task-price"
          />
          <LiveText tone="muted">{t('taskPricing.taskNote')}</LiveText>
        </>
      ) : (
        <>
          <ShiftFormField
            label={S.duration}
            value={durationHours}
            onChangeText={value => {
              const text = value.replace(/[^\d.]/g, '');
              setDurationHours(text);
              set(
                'durationMinutes',
                text ? Math.round(Number(text) * 60) : Number.NaN,
              );
            }}
            keyboardType="decimal-pad"
            placeholder="2"
            error={errors.durationMinutes}
            testID="business-live-work-duration"
          />
          <ShiftFormField
            label={S.rate}
            value={form.rate}
            onChangeText={value => set('rate', value.replace(/[^\d.]/g, ''))}
            keyboardType="decimal-pad"
            prefix="₹"
            placeholder="450"
            error={errors.rate}
            testID="business-live-work-rate"
          />
        </>
      )}
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  stack: { gap: 6 },
  multiline: { minHeight: 64, paddingTop: 10 },
});
