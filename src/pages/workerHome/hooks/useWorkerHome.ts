import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { Shift, ShiftStatus, TabAppNavigation } from '@/types';

import {
  ALL_CATEGORIES_ID,
  ANY_ID,
  CATEGORIES,
  DISTANCE_OPTIONS,
  LENGTH_OPTIONS,
  LOCATIONS,
  NEARBY_SHIFTS,
  PAY_OPTIONS,
  RECOMMENDED_SHIFTS,
  WORKER,
} from '../mock';

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

const matchesQuery = (shift: Shift, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) {
    return true;
  }
  return [shift.title, shift.businessName, shift.area].some(field =>
    field.toLowerCase().includes(q),
  );
};

const matchesFilters = (shift: Shift, f: ShiftFilters) => {
  const distance = DISTANCE_OPTIONS.find(o => o.id === f.distanceId);
  const pay = PAY_OPTIONS.find(o => o.id === f.payId);
  const length = LENGTH_OPTIONS.find(o => o.id === f.lengthId);
  return (
    (!distance || shift.distanceKm <= distance.max) &&
    (!pay || shift.hourlyRate >= pay.min) &&
    (!length ||
      (shift.durationHours >= length.min &&
        shift.durationHours <= length.max)) &&
    (!f.businessTypeIds.length ||
      f.businessTypeIds.includes(shift.businessTypeId)) &&
    (!f.verifiedOnly || shift.isVerified)
  );
};

const countActive = (f: ShiftFilters) =>
  [f.distanceId, f.payId, f.lengthId].filter(id => id !== ANY_ID).length +
  (f.businessTypeIds.length ? 1 : 0) +
  (f.verifiedOnly ? 1 : 0);

export const useWorkerHome = () => {
  const navigation = useNavigation<TabAppNavigation>();
  const isLoading = useMockLoading();
  const [status, setStatus] = useState<ShiftStatus>('live');
  const [categoryId, setCategoryId] = useState(ALL_CATEGORIES_ID);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [locationId, setLocationId] = useState(LOCATIONS[0].id);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const visible = (shift: Shift) =>
    (categoryId === ALL_CATEGORIES_ID || shift.categoryId === categoryId) &&
    matchesQuery(shift, query) &&
    matchesFilters(shift, filters);

  const nearby = NEARBY_SHIFTS.filter(
    shift => shift.status === status && visible(shift),
  );

  return {
    isLoading,
    worker: WORKER,
    openShift: (shift: Shift) =>
      shift.status === 'live'
        ? navigation.navigate(ROUTES.liveRequest, { shift })
        : navigation.navigate(ROUTES.shiftDetails, { shift }),
    openAllShifts: () => navigation.navigate(ROUTES.shiftList),
    openNotifications: () => navigation.navigate(ROUTES.notifications),
    locations: LOCATIONS,
    locationId,
    locationLabel:
      LOCATIONS.find(l => l.id === locationId)?.label ?? WORKER.location,
    isLocationOpen,
    toggleLocation: () => setIsLocationOpen(prev => !prev),
    selectLocation: (id: string) => {
      setLocationId(id);
      setIsLocationOpen(false);
    },
    categories: CATEGORIES,
    status,
    setStatus,
    categoryId,
    setCategoryId,
    query,
    setQuery,
    nearby,
    recommended: RECOMMENDED_SHIFTS.filter(visible),
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
