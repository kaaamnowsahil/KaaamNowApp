import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { errorMessage } from '@/services/api/apiClient';
import { meApi } from '@/services/api/meApi';
import { getDevicePosition, type DevicePosition } from '@/services/maps/devicePosition';
import { useLocationHeartbeat } from '@/services/maps/locationHeartbeat';
import { reverseGeocode } from '@/services/maps/googleMaps';
import { isTaskShift, toShift } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { Shift, ShiftStatus, TabAppNavigation } from '@/types';

import {
  ANY_ID,
  DISTANCE_OPTIONS,
  LENGTH_OPTIONS,
  PAY_OPTIONS,
} from '../constants/filterOptions';
import { WORKER_HOME_STRINGS } from '../constants/workerHomeStrings';

export type ShiftFilters = {
  distanceId: string;
  payId: string;
  lengthId: string;
  /** Empty means any business type. */
  businessTypeIds: string[];
  verifiedOnly: boolean;
};

export const DEFAULT_FILTERS: ShiftFilters = {
  distanceId: ANY_ID,
  payId: ANY_ID,
  lengthId: ANY_ID,
  businessTypeIds: [],
  verifiedOnly: false,
};

/** Pay, length and verified are not API filters, so they apply to the loaded page. */
const matchesLocalFilters = (shift: Shift, f: ShiftFilters) => {
  const pay = PAY_OPTIONS.find(o => o.id === f.payId);
  const length = LENGTH_OPTIONS.find(o => o.id === f.lengthId);
  const task = isTaskShift(shift);
  return (
    (!pay || task || shift.hourlyRate >= pay.min) &&
    (!length ||
      task ||
      (shift.durationHours >= length.min && shift.durationHours <= length.max)) &&
    (!f.verifiedOnly || shift.isVerified)
  );
};

const countActive = (f: ShiftFilters) =>
  [f.distanceId, f.payId, f.lengthId].filter(id => id !== ANY_ID).length +
  (f.businessTypeIds.length ? 1 : 0) +
  (f.verifiedOnly ? 1 : 0);

const FEED_PAGE_SIZE = 10;

const firstName = (fullName?: string | null) => fullName?.trim().split(/\s+/)[0] ?? '';

export const useWorkerHome = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const [status, setStatus] = useState<ShiftStatus>('live');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [position, setPosition] = useState<DevicePosition | null>(null);
  const [positionResolved, setPositionResolved] = useState(false);
  const [currentLabel, setCurrentLabel] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');
  const isMounted = useRef(true);
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [availabilityPending, setAvailabilityPending] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false);

  const profile = useApiQuery(() => meApi.profile(), []);
  const businessTypes = useApiQuery(() => meApi.businessTypes(), []);
  const worker = profile.data?.worker;
  const isAvailable = availability ?? worker?.is_available ?? false;
  const heartbeat = useLocationHeartbeat(isAvailable, () => setAvailability(false));

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const locate = useCallback(async () => {
    setIsLocating(true);
    setLocationError('');
    const next = await getDevicePosition();
    if (!isMounted.current) return;
    if (next) {
      setPosition(next);
      const label = await reverseGeocode(next).catch(() => null);
      if (isMounted.current) setCurrentLabel(label ?? '');
    } else {
      setLocationError(WORKER_HOME_STRINGS.AVAILABILITY.LOCATION_DENIED);
    }
    if (isMounted.current) {
      setPositionResolved(true);
      setIsLocating(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    locate().catch(() => undefined);
    return () => {
      isMounted.current = false;
    };
  }, [locate]);

  const savedCoords =
    worker?.latitude != null && worker?.longitude != null
      ? { latitude: worker.latitude, longitude: worker.longitude }
      : null;
  const coords = position ?? savedCoords;
  const radius = DISTANCE_OPTIONS.find(o => o.id === filters.distanceId)?.max;

  const fetchPage = async (offset: number) => {
    const page = await shiftsApi.feed({
      shift_type: status,
      q: debouncedQuery || undefined,
      lat: coords?.latitude,
      lng: coords?.longitude,
      radius_km: radius && Number.isFinite(radius) ? radius : undefined,
      limit: FEED_PAGE_SIZE,
      offset,
      ...(filters.businessTypeIds.length
        ? { business_type_slugs: filters.businessTypeIds.join(',') }
        : {}),
    });
    return {
      shifts: page.items.map(toShift),
      hasMore: page.items.length === FEED_PAGE_SIZE,
    };
  };

  const feed = useApiQuery(
    async () => (positionResolved ? fetchPage(0) : null),
    [
      positionResolved,
      status,
      debouncedQuery,
      coords?.latitude,
      coords?.longitude,
      radius,
      filters.businessTypeIds.join(','),
    ],
  );

  const savedLabel = worker?.address_text || worker?.locality || '';

  const [extra, setExtra] = useState<{ shifts: Shift[]; hasMore: boolean } | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState('');

  useEffect(() => {
    setExtra(null);
    setLoadMoreError('');
  }, [feed.data]);

  const loaded = useMemo(
    () => [...(feed.data?.shifts ?? []), ...(extra?.shifts ?? [])],
    [feed.data, extra],
  );
  const hasMore = extra ? extra.hasMore : (feed.data?.hasMore ?? false);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setLoadMoreError('');
    try {
      const next = await fetchPage(loaded.length);
      setExtra(prev => ({
        shifts: [...(prev?.shifts ?? []), ...next.shifts],
        hasMore: next.hasMore,
      }));
    } catch (cause) {
      setLoadMoreError(errorMessage(cause));
    } finally {
      setIsLoadingMore(false);
    }
  };

  const nearby = useMemo(
    () => loaded.filter(shift => matchesLocalFilters(shift, filters)),
    [loaded, filters],
  );

  const runAvailability = async (task: () => Promise<void>) => {
    setAvailabilityPending(true);
    setAvailabilityError(null);
    try {
      await task();
    } catch (cause) {
      setAvailabilityError(errorMessage(cause));
    } finally {
      setAvailabilityPending(false);
    }
  };

  const toggleAvailability = () =>
    runAvailability(async () => {
      if (isAvailable) {
        const response = await shiftsApi.setAvailability({ is_available: false });
        setAvailability(response.is_available);
        return;
      }
      const verification = (await meApi.profile()).worker?.verification_status;
      if (verification !== 'verified') {
        setAvailabilityError(
          verification === 'rejected'
            ? WORKER_HOME_STRINGS.AVAILABILITY.VERIFICATION_REJECTED
            : WORKER_HOME_STRINGS.AVAILABILITY.VERIFICATION_PENDING,
        );
        return;
      }
      setIsLocationPromptOpen(true);
    });

  const shareLocationAndGoOnline = () =>
    runAvailability(async () => {
      const location = await getDevicePosition();
      if (!location) {
        setAvailabilityError(WORKER_HOME_STRINGS.AVAILABILITY.LOCATION_DENIED);
        return;
      }
      setPosition(location);
      const response = await shiftsApi.setAvailability({
        is_available: true,
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setAvailability(response.is_available);
      setIsLocationPromptOpen(false);
    });

  const openShift = (shift: Shift) =>
    navigation.navigate(ROUTES.shiftDetails, { shift });

  return {
    isLoading: !positionResolved || feed.isLoading,
    error: feed.error,
    retry: feed.reload,
    firstName: firstName(worker?.full_name),
    isAvailable,
    availabilityPending,
    availabilityError:
      availabilityError ??
      (heartbeat === 'no_location' ? WORKER_HOME_STRINGS.AVAILABILITY.LOCATION_DENIED : null),
    toggleAvailability: () => {
      toggleAvailability().catch(() => undefined);
    },
    isLocationPromptOpen,
    shareLocationAndGoOnline: () => {
      shareLocationAndGoOnline().catch(() => undefined);
    },
    closeLocationPrompt: () => {
      setIsLocationPromptOpen(false);
      setAvailabilityError(null);
    },
    openShift,
    openNotifications: () => navigation.navigate(ROUTES.notifications),
    locationLabel: (position ? currentLabel : '') || savedLabel,
    isLocating,
    locationError,
    refreshLocation: () => {
      locate().catch(() => undefined);
    },
    businessTypes: businessTypes.data ?? [],
    status,
    setStatus,
    query,
    setQuery,
    nearby,
    hasMore,
    isLoadingMore,
    loadMoreError,
    loadMore: () => {
      loadMore().catch(() => undefined);
    },
    filters,
    activeFilterCount: countActive(filters),
    isFilterOpen,
    openFilters: () => setIsFilterOpen(true),
    closeFilters: () => setIsFilterOpen(false),
    showScheduled: () => setStatus('scheduled'),
    applyFilters: (next: ShiftFilters) => {
      setFilters(next);
      setIsFilterOpen(false);
    },
  };
};
