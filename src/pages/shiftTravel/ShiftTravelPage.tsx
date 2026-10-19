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
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { AppScreenProps } from '@/types';
import { mapsUrl } from '@/utils/links';

import { SHIFT_TRAVEL_STRINGS as S } from './constants';
import { TRAVEL } from './mock';

/**
 * Live shift step 4. Figma: NEW · Live · Heading to business.
 * "Start navigation" opens maps, then the button becomes "I've arrived".
 * - data: mock/shiftTravelMock.ts
 */
export const ShiftTravelPage: FC<AppScreenProps<typeof ROUTES.shiftTravel>> = ({
  navigation,
  route,
}) => {
  const { shift } = route.params;
  const isLoading = useMockLoading();
  const [isNavigating, setIsNavigating] = useState(false);

  const openMaps = () =>
    Linking.openURL(mapsUrl(`${shift.businessName}, ${TRAVEL.address}`));

  const primary = () => {
    if (isNavigating) {
      navigation.navigate(ROUTES.shiftCheckIn, { shift });
      return;
    }
    setIsNavigating(true);
    openMaps();
  };

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={S.HEADER_TITLE}
      subtitle={S.HEADER_SUBTITLE}
      gap={14}
      isLoading={isLoading}
      testID="shift-travel-page"
      actions={
        <>
          <PrimaryButton
            label={isNavigating ? S.ARRIVED : S.START_NAVIGATION}
            onPress={primary}
            testID="shift-travel-primary"
          />
          <SecondaryButton
            label={S.MESSAGE}
            onPress={() => Linking.openURL(`sms:${TRAVEL.businessPhone}`)}
            testID="shift-travel-message"
          />
        </>
      }
    >
      <FlowHeading
        overline={S.OVERLINE}
        tone="success"
        title={S.heading(shift.businessName)}
      />
      <MapPreview variant="route" height={196} />
      <StatTiles
        items={[
          { value: S.eta(TRAVEL.etaMinutes), label: S.ETA },
          { value: S.distance(shift.distanceKm), label: S.DISTANCE },
        ]}
      />
      <InfoCard
        title={shift.businessName}
        caption={S.placeCaption(TRAVEL.address, TRAVEL.startsLabel)}
        badge={S.LIVE}
        badgeTone="success"
        onPress={openMaps}
        testID="shift-travel-place"
      />
    </FormScreen>
  );
};
