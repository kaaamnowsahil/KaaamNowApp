import type { FC } from 'react';

import { StatTiles, StatusHero } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import { SHIFT_COMPLETE_STRINGS as S } from './constants';
import { COMPLETED } from './mock';

/**
 * Live shift step 8. Figma: Live · Shift completed (light/dark).
 * - data: mock/shiftCompleteMock.ts
 */
export const ShiftCompletePage: FC<
  AppScreenProps<typeof ROUTES.shiftComplete>
> = ({ navigation, route }) => {
  const { shift } = route.params;
  const isLoading = useMockLoading();

  return (
    <FormScreen
      onBack={() => navigation.popToTop()}
      title={S.HEADER_TITLE}
      compactTitle
      headerTag={S.HEADER_RIGHT}
      gap={16}
      isLoading={isLoading}
      testID="shift-complete-page"
      actions={
        <>
          <PrimaryButton
            label={S.VIEW_EARNINGS}
            onPress={() =>
              navigation.popTo(ROUTES.mainTabs, {
                screen: ROUTES.workerEarnings,
              })
            }
            testID="shift-complete-earnings"
          />
          <SecondaryButton
            label={S.RATE}
            onPress={() => navigation.replace(ROUTES.rateBusiness, { shift })}
            testID="shift-complete-rate"
          />
        </>
      }
    >
      <StatusHero
        overline={S.OVERLINE}
        title={S.HEADING}
        subtitle={S.subtitle(COMPLETED.workerFirstName, COMPLETED.checkOutTime)}
      />
      <StatTiles
        items={[
          { value: S.hours(COMPLETED.recordedHours), label: S.RECORDED },
          {
            value: formatRupees(shift.hourlyRate * COMPLETED.recordedHours),
            label: S.EARNINGS,
          },
        ]}
      />
    </FormScreen>
  );
};
