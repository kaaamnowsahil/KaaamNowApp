import { useCallback, type FC } from 'react';

import CircleCheckIcon from '@/assets/icons/circle-check.svg';
import { StatusHero } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { bookingRef } from '@/services/shifts/useShiftFlow';
import { useHardwareBack } from '@/shared/hooks/useHardwareBack';
import type { AppScreenProps } from '@/types';

import { APPLICATION_SUBMITTED_STRINGS } from './constants';

/**
 * Scheduled flow step 3. Figma: "Scheduled · Application submitted" (light/dark).
 * Back and "Browse other shifts" return to Discover; tracking opens My shifts.
 * - data: application id from POST /worker/shifts/{id}/applications
 */
export const ApplicationSubmittedPage: FC<
  AppScreenProps<typeof ROUTES.applicationSubmitted>
> = ({ navigation, route }) => {
  const { shift } = route.params;

  const browse = useCallback(
    () => navigation.popTo(ROUTES.mainTabs, { screen: ROUTES.workerHome }),
    [navigation],
  );
  useHardwareBack(browse);

  return (
    <FormScreen
      onBack={browse}
      title={APPLICATION_SUBMITTED_STRINGS.HEADER_TITLE}
      compactTitle
      headerTag={APPLICATION_SUBMITTED_STRINGS.HEADER_TAG}
      testID="application-submitted-page"
      actions={
        <>
          <PrimaryButton
            label={APPLICATION_SUBMITTED_STRINGS.TRACK}
            onPress={() =>
              navigation.popTo(ROUTES.mainTabs, { screen: ROUTES.workerShifts })
            }
            testID="application-submitted-track"
          />
          <SecondaryButton
            label={APPLICATION_SUBMITTED_STRINGS.BROWSE}
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
        overline={APPLICATION_SUBMITTED_STRINGS.overline(bookingRef(shift.applicationId))}
        title={APPLICATION_SUBMITTED_STRINGS.HEADING}
        subtitle={APPLICATION_SUBMITTED_STRINGS.subtitle(shift.businessName)}
      />
    </FormScreen>
  );
};
