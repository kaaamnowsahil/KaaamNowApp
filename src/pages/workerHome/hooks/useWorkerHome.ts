import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { errorMessage } from '@/services/api/apiClient';
import { meApi } from '@/services/api/meApi';
import { getDevicePosition, type DevicePosition } from '@/services/maps/devicePosition';
import { reverseGeocode } from '@/services/maps/googleMaps';
import { toShift } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { Option, Shift, ShiftStatus, TabAppNavigation } from '@/types';

import {
  ANY_ID,
  CURRENT_LOCATION_ID,
  DISTANCE_OPTIONS,
  LENGTH_OPTIONS,
  PAY_OPTIONS,
  SAVED_LOCATION_ID,
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
  return (
    (!pay || shift.hourlyRate >= pay.min) &&
    (!length ||
      (shift.durationHours >= length.min && shift.durationHours <= length.max)) &&
    (!f.verifiedOnly || shift.isVerified)
  );
};

const countActive = (f: ShiftFilters) =>
  [f.distanceId, f.payId, f.lengthId].filter(id => id !== ANY_ID).length +
  (f.businessTypeIds.length ? 1 : 0) +
  (f.verifiedOnly ? 1 : 0);

const firstName = (fullName?: string | null) => fullName?.trim().split(/\s+/)[0] ?? '';

export const useWorkerHome = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const [status, setStatus] = useState<ShiftStatus>('live');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [locationId, setLocationId] = useState(CURRENT_LOCATION_ID);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [position, setPosition] = useState<DevicePosition | null>(null);
  const [positionResolved, setPositionResolved] = useState(false);
  const [currentLabel, setCurrentLabel] = useState('');
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [availabilityPending, setAvailabilityPending] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isLocationPromptOpen, setIsLocationPromptOpen] = useState(false);

  const profile = useApiQuery(() => meApi.profile(), []);
  const businessTypes = useApiQuery(() => meApi.businessTypes(), []);
  const worker = profile.data?.worker;
  const isAvailable = availability ?? worker?.is_available ?? false;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;
    getDevicePosition().then(async next => {
      if (!active) return;
      setPosition(next);
      setPositionResolved(true);
      if (!next) {
        setLocationId(SAVED_LOCATION_ID);
        return;
      }
      const label = await reverseGeocode(next).catch(() => null);
      if (active && label) setCurrentLabel(label);
    });
    return () => {
      active = false;
    };
  }, []);

  const coords = locationId === CURRENT_LOCATION_ID ? position : null;
  const radius = DISTANCE_OPTIONS.find(o => o.id === filters.distanceId)?.max;

  const feed = useApiQuery(
    async () => {
      if (!positionResolved) return null;
      const page = await shiftsApi.feed({
        shift_type: status,
        q: debouncedQuery || undefined,
        lat: coords?.latitude,
        lng: coords?.longitude,
        radius_km: radius && Number.isFinite(radius) ? radius : undefined,
        limit: 50,
        ...(filters.businessTypeIds.length
          ? { business_type_slugs: filters.businessTypeIds.join(',') }
          : {}),
      });
      return page.items.map(toShift);
    },
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

  const savedLabel = worker?.locality || worker?.address_text || 'Saved address';
  const locations: Option[] = [
    ...(position
      ? [{ id: CURRENT_LOCATION_ID, label: currentLabel || 'Current location' }]
      : []),
    { id: SAVED_LOCATION_ID, label: savedLabel },
  ];

  const nearby = useMemo(
    () => (feed.data ?? []).filter(shift => matchesLocalFilters(shift, filters)),
    [feed.data, filters],
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
    shift.status === 'live'
      ? navigation.navigate(ROUTES.shiftRequest, { shift })
      : navigation.navigate(ROUTES.shiftDetails, { shift });

  return {
    isLoading: !positionResolved || feed.isLoading,
    error: feed.error,
    retry: feed.reload,
    firstName: firstName(worker?.full_name),
    isAvailable,
    availabilityPending,
    availabilityError,
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
    locations,
    locationId,
    locationLabel: locations.find(l => l.id === locationId)?.label ?? savedLabel,
    isLocationOpen,
    toggleLocation: () => setIsLocationOpen(prev => !prev),
    selectLocation: (id: string) => {
      setLocationId(id);
      setIsLocationOpen(false);
    },
    businessTypes: businessTypes.data ?? [],
    status,
    setStatus,
    query,
    setQuery,
    nearby,
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
