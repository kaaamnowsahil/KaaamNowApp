import { meApi } from '@/services/api/meApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';

import { shiftsApi, type BusinessShiftItem } from './shiftsApi';

const byStart = (a: BusinessShiftItem, b: BusinessShiftItem) =>
  new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();

/** Business profile plus its in-progress, upcoming and draft shifts. */
export const useBusinessShiftsData = () => {
  const query = useApiQuery(
    () =>
      Promise.all([
        meApi.profile(),
        shiftsApi.businessShifts({ group: 'in_progress' }),
        shiftsApi.businessShifts({ group: 'upcoming' }),
        shiftsApi.businessShifts({ group: 'draft' }),
      ]),
    [],
  );
  const [profile, inProgress, upcoming, drafts] = query.data ?? [];
  const active = [
    ...(inProgress?.items ?? []),
    ...(upcoming?.items ?? []),
  ].sort(byStart);
  const business = profile?.business;

  return {
    ...query,
    businessName: business?.business_name ?? '',
    isVerified: business?.verification_status === 'verified',
    location: business?.address_text || business?.locality || '',
    liveShifts: active.filter(item => item.shift_type === 'live'),
    scheduledShifts: active.filter(item => item.shift_type === 'scheduled'),
    drafts: [...(drafts?.items ?? [])].sort(byStart),
  };
};
