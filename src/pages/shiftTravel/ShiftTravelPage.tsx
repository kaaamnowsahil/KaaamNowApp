import { useState, type FC } from 'react';
import { Linking } from 'react-native';

import {
  FlowHeading,
  InfoCard,
  MapPreview,
  StatTiles,
} from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { formatTime } from '@/services/shifts/shiftMappers';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { AppScreenProps } from '@/types';
import { mapsUrl } from '@/utils/links';

import { SHIFT_TRAVEL_STRINGS } from './constants';

/**
 * Live shift step 4. Figma: NEW · Live · Heading to business.
 * "Start navigation" marks the worker en route and opens maps, then the button becomes "I've arrived".
 * - data: GET /assignments/{id}/tracking; POST /worker/assignments/{id}/start-travel
 */
export const ShiftTravelPage: FC<AppScreenProps<typeof ROUTES.shiftTravel>> = ({
  navigation,
  route,
}) => {
  const { shift } = route.params;
  const assignmentId = shift.assignmentId ?? '';
  const action = useShiftAction();
  const [isNavigating, setIsNavigating] = useState(shift.assignmentStatus === 'en_route');
  const tracking = useApiQuery(
    async () => (assignmentId ? shiftsApi.tracking(assignmentId) : null),
    [assignmentId],
  );
  const address = shift.addressText || shift.area;
  const eta = tracking.data?.eta_minutes;
  const distance = tracking.data?.distance_km ?? shift.distanceKm;

  const openMaps = () => Linking.openURL(mapsUrl(`${shift.businessName}, ${address}`));

  const primary = () => {
    if (isNavigating) {
      navigation.navigate(ROUTES.shiftCheckIn, {
        shift: { ...shift, assignmentStatus: 'en_route' },
      });
      return;
    }
    action.run(
      () => shiftsApi.startTravel(assignmentId),
      () => {
        setIsNavigating(true);
        openMaps();
      },
      SHIFT_TRAVEL_STRINGS.START_FAILED,
    );
  };

  const message = () =>
    action.run(
      () => shiftsApi.contact(assignmentId),
      contact => Linking.openURL(`sms:${contact.phone}`),
      SHIFT_TRAVEL_STRINGS.CONTACT_FAILED,
    );

  return (
    <FormScreen
      busy={action.busy}
      onBack={navigation.goBack}
      title={SHIFT_TRAVEL_STRINGS.HEADER_TITLE}
      subtitle={SHIFT_TRAVEL_STRINGS.HEADER_SUBTITLE}
      gap={14}
      isLoading={tracking.isLoading}
      testID="shift-travel-page"
      actions={
        <>
          <PrimaryButton
            label={isNavigating ? SHIFT_TRAVEL_STRINGS.ARRIVED : SHIFT_TRAVEL_STRINGS.START_NAVIGATION}
            disabled={action.busy || !assignmentId}
            onPress={primary}
            testID="shift-travel-primary"
          />
          <SecondaryButton
            label={SHIFT_TRAVEL_STRINGS.MESSAGE}
            disabled={action.busy || !assignmentId}
            onPress={message}
            testID="shift-travel-message"
          />
        </>
      }
    >
      <FlowHeading
        overline={SHIFT_TRAVEL_STRINGS.OVERLINE}
        tone="success"
        title={SHIFT_TRAVEL_STRINGS.heading(shift.businessName)}
      />
      <MapPreview variant="route" height={196} />
      <StatTiles
        items={[
          {
            value: eta == null ? SHIFT_TRAVEL_STRINGS.NO_ETA : SHIFT_TRAVEL_STRINGS.eta(eta),
            label: SHIFT_TRAVEL_STRINGS.ETA,
          },
          {
            value: SHIFT_TRAVEL_STRINGS.distance(Math.round(distance * 10) / 10),
            label: SHIFT_TRAVEL_STRINGS.DISTANCE,
          },
        ]}
      />
      <InfoCard
        title={shift.businessName}
        caption={SHIFT_TRAVEL_STRINGS.placeCaption(
          address,
          shift.startsAt
            ? SHIFT_TRAVEL_STRINGS.startsAt(formatTime(shift.startsAt))
            : shift.timeLabel,
        )}
        badge={SHIFT_TRAVEL_STRINGS.LIVE}
        badgeTone="success"
        onPress={openMaps}
        testID="shift-travel-place"
      />
    </FormScreen>
  );
};
