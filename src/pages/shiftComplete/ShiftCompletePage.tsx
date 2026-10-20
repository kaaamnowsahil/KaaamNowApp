import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { StatTiles, StatusHero } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import { COMPLETED } from './mock';

/**
 * Live shift step 8. Figma: Live · Shift completed (light/dark).
 * - data: mock/shiftCompleteMock.ts
 */
export const ShiftCompletePage: FC<
  AppScreenProps<typeof ROUTES.shiftComplete>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { shift } = route.params;
  const isLoading = useMockLoading();

  return (
    <FormScreen
      onBack={() => navigation.popToTop()}
      title={t('workerFlow.shiftSecured.headerTitle')}
      compactTitle
      headerTag={t('workerFlow.checkIn.headerRight')}
      gap={16}
      isLoading={isLoading}
      testID="shift-complete-page"
      actions={
        <>
          <PrimaryButton
            label={t('workerFlow.shiftComplete.viewEarnings')}
            onPress={() =>
              navigation.popTo(ROUTES.mainTabs, {
                screen: ROUTES.workerEarnings,
              })
            }
            testID="shift-complete-earnings"
          />
          <SecondaryButton
            label={t('workerFlow.shiftComplete.rateBusiness')}
            onPress={() => navigation.replace(ROUTES.rateBusiness, { shift })}
            testID="shift-complete-rate"
          />
        </>
      }
    >
      <StatusHero
        overline={t('workerFlow.shiftComplete.overline')}
        title={t('workerFlow.shiftComplete.heading')}
        subtitle={t('workerFlow.shiftComplete.subtitle', {
          name: COMPLETED.workerFirstName,
          time: COMPLETED.checkOutTime,
        })}
      />
      <StatTiles
        items={[
          {
            value: t('workerFlow.shiftComplete.hours', {
              count: COMPLETED.recordedHours,
            }),
            label: t('workerFlow.shiftComplete.recorded'),
          },
          {
            value: formatRupees(shift.hourlyRate * COMPLETED.recordedHours),
            label: t('workerFlow.shiftComplete.earnings'),
          },
        ]}
      />
    </FormScreen>
  );
};
