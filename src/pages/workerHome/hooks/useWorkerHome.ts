import { useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { meApi } from '@/services/api/meApi';
import { getDevicePosition, type DevicePosition } from '@/services/maps/devicePosition';
import { reverseGeocode } from '@/services/maps/googleMaps';
import { toShift } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { Option, Shift, ShiftStatus, TabAppNavigation } from '@/types';

import {
  ALL_CATEGORIES_ID,
  ANY_ID,
  CURRENT_LOCATION_ID,
  DISTANCE_OPTIONS,
  LENGTH_OPTIONS,
  PAY_OPTIONS,
  SAVED_LOCATION_ID,
} from '../constants/filterOptions';

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
  const [categoryId, setCategoryId] = useState(ALL_CATEGORIES_ID);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [locationId, setLocationId] = useState(CURRENT_LOCATION_ID);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [position, setPosition] = useState<DevicePosition | null>(null);
  const [positionResolved, setPositionResolved] = useState(false);
  const [currentLabel, setCurrentLabel] = useState('');

  const profile = useApiQuery(() => meApi.profile(), []);
  const categories = useApiQuery(() => meApi.workCategories(), []);
  const businessTypes = useApiQuery(() => meApi.businessTypes(), []);
  const worker = profile.data?.worker;

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
        category: categoryId === ALL_CATEGORIES_ID ? undefined : categoryId,
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
      categoryId,
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

  const openShift = (shift: Shift) =>
    shift.status === 'live'
      ? navigation.navigate(ROUTES.shiftRequest, { shift })
      : navigation.navigate(ROUTES.shiftDetails, { shift });

  return {
    isLoading: !positionResolved || feed.isLoading,
    error: feed.error,
    retry: feed.reload,
    firstName: firstName(worker?.full_name),
    openShift,
    openAllShifts: () => navigation.navigate(ROUTES.shiftList),
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
    categories: [
      { id: ALL_CATEGORIES_ID, label: 'All roles' },
      ...(categories.data ?? []),
    ],
    businessTypes: businessTypes.data ?? [],
    status,
    setStatus,
    categoryId,
    setCategoryId,
    query,
    setQuery,
    nearby,
    filters,
    activeFilterCount: countActive(filters),
    isFilterOpen,
    openFilters: () => setIsFilterOpen(true),
    closeFilters: () => setIsFilterOpen(false),
    showScheduled: () => setStatus('scheduled'),
    clearFilters: () => {
      setFilters(DEFAULT_FILTERS);
      setQuery('');
      setCategoryId(ALL_CATEGORIES_ID);
    },
    applyFilters: (next: ShiftFilters) => {
      setFilters(next);
      setIsFilterOpen(false);
    },
  };
};
