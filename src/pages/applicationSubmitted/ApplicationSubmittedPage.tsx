import { useCallback, type FC } from 'react';

import CircleCheckIcon from '@/assets/icons/circle-check.svg';
import { StatusHero } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useHardwareBack } from '@/shared/hooks/useHardwareBack';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { AppScreenProps } from '@/types';

import { APPLICATION_SUBMITTED_STRINGS as S } from './constants';
import { APPLICATION_REFS, DEFAULT_APPLICATION_REF } from './mock';

/**
 * Scheduled flow step 3. Figma: "Scheduled · Application submitted" (light/dark).
 * Back and "Browse other shifts" return to Discover; tracking opens My shifts.
 * - data: mock/applicationSubmittedMock.ts
 */
export const ApplicationSubmittedPage: FC<
  AppScreenProps<typeof ROUTES.applicationSubmitted>
> = ({ navigation, route }) => {
  const { shift } = route.params;
  const isLoading = useMockLoading();

  const browse = useCallback(
    () => navigation.popTo(ROUTES.mainTabs, { screen: ROUTES.workerHome }),
    [navigation],
  );
  useHardwareBack(browse);

  return (
    <FormScreen
      onBack={browse}
      title={S.HEADER_TITLE}
      compactTitle
      headerTag={S.HEADER_TAG}
      isLoading={isLoading}
      testID="application-submitted-page"
      actions={
        <>
          <PrimaryButton
            label={S.TRACK}
            onPress={() =>
              navigation.popTo(ROUTES.mainTabs, { screen: ROUTES.workerShifts })
            }
            testID="application-submitted-track"
          />
          <SecondaryButton
            label={S.BROWSE}
            onPress={browse}
            testID="application-submitted-browse"
          />
        </>
      }
    >
      <StatusHero
        tone="primary"
        size="large"
        icon={CircleCheckIcon}
        overline={S.overline(APPLICATION_REFS[shift.id] ?? DEFAULT_APPLICATION_REF)}
        title={S.HEADING}
        subtitle={S.subtitle(shift.businessName)}
      />
    </FormScreen>
  );
};
