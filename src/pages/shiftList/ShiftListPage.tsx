import type { FC } from 'react';

import { ShiftCard } from '@/components/shift';
import { BodyNote } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { AppScreenProps } from '@/types';

import { SHIFT_LIST_STRINGS as S } from './constants';
import { RECOMMENDED_SHIFTS } from './mock';

/** Discover "See all". Data: mock/shiftListMock.ts */
export const ShiftListPage: FC<AppScreenProps<typeof ROUTES.shiftList>> = ({
  navigation,
}) => {
  const isLoading = useMockLoading();
  return (
  <FormScreen
    onBack={navigation.goBack}
    title={S.TITLE}
    gap={10}
    isLoading={isLoading}
    testID="shift-list-page"
  >
    <BodyNote>{S.SUBTITLE}</BodyNote>
    {RECOMMENDED_SHIFTS.map(shift => (
      <ShiftCard
        key={shift.id}
        shift={shift}
        onPress={() => navigation.navigate(ROUTES.shiftDetails, { shift })}
      />
    ))}
  </FormScreen>
  );
};
