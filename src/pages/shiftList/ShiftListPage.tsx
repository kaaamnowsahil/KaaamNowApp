import type { FC } from 'react';

import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import { ShiftCard } from '@/components/shift';
import { BodyNote, EmptyState } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { toShift } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { AppScreenProps } from '@/types';

import { SHIFT_LIST_STRINGS } from './constants';

/** Discover "See all": every scheduled shift near the worker. Data: GET /worker/feed */
export const ShiftListPage: FC<AppScreenProps<typeof ROUTES.shiftList>> = ({
  navigation,
}) => {
  const feed = useApiQuery(
    async () =>
      (await shiftsApi.feed({ shift_type: 'scheduled', sort: 'starts_at', limit: 100 })).items.map(
        toShift,
      ),
    [],
  );
  const shifts = feed.data ?? [];

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={SHIFT_LIST_STRINGS.TITLE}
      gap={10}
      fillLastBlock={shifts.length === 0}
      isLoading={feed.isLoading}
      testID="shift-list-page"
    >
      <BodyNote>{SHIFT_LIST_STRINGS.SUBTITLE}</BodyNote>
      {shifts.length ? (
        shifts.map(shift => (
          <ShiftCard
            key={shift.id}
            shift={shift}
            onPress={() => navigation.navigate(ROUTES.shiftDetails, { shift })}
          />
        ))
      ) : (
        <EmptyState
          icon={CalendarDaysIcon}
          title={feed.error ? SHIFT_LIST_STRINGS.ERROR_TITLE : SHIFT_LIST_STRINGS.EMPTY_TITLE}
          body={feed.error || SHIFT_LIST_STRINGS.EMPTY_BODY}
          action={feed.error ? SHIFT_LIST_STRINGS.RETRY : undefined}
          onAction={feed.error ? feed.reload : undefined}
        />
      )}
    </FormScreen>
  );
};
