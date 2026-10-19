import { useState, type FC } from 'react';
import { Alert, Linking, View } from 'react-native';

import ClockIcon from '@/assets/icons/clock.svg';
import { DetailRow, ReasonSheet, StatusHero } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';
import { mapsUrl } from '@/utils/links';

import { SHIFT_SELECTED_STRINGS as S } from './constants';
import { DECLINE_REASONS, DEFAULT_OFFER, OFFERS } from './mock';

/**
 * Scheduled flow step 4. Figma: "Scheduled · You've been selected" (light/dark).
 * Confirming secures the place; declining asks for a reason first (not in Figma).
 * - data: mock/shiftSelectedMock.ts
 */
export const ShiftSelectedPage: FC<
  AppScreenProps<typeof ROUTES.shiftSelected>
> = ({ navigation, route }) => {
  const { shift } = route.params;
  const isLoading = useMockLoading();
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const offer = OFFERS[shift.id] ?? DEFAULT_OFFER;
  const workplace = offer.workplace || shift.area;

  const openDetails = () =>
    navigation.navigate(ROUTES.shiftDetails, {
      shift,
      bookingStatus: 'selected',
    });

  const decline = () => {
    setIsDeclineOpen(false);
    Alert.alert(S.DECLINED_TITLE, S.DECLINED_BODY, [
      {
        text: S.OK,
        onPress: () =>
          navigation.popTo(ROUTES.mainTabs, { screen: ROUTES.workerShifts }),
      },
    ]);
  };

  return (
    <>
      <FormScreen
        onBack={navigation.goBack}
        title={S.HEADER_TITLE}
        compactTitle
        headerTag={S.HEADER_TAG}
        gap={20}
        isLoading={isLoading}
        testID="shift-selected-page"
        actions={
          <>
            <PrimaryButton
              label={S.CONFIRM}
              onPress={() => navigation.replace(ROUTES.shiftSecured, { shift })}
              testID="shift-selected-confirm"
            />
            <SecondaryButton
              label={S.DECLINE}
              onPress={() => setIsDeclineOpen(true)}
              testID="shift-selected-decline"
            />
          </>
        }
      >
        <StatusHero
          tone="warning"
          size="large"
          icon={ClockIcon}
          overline={S.OVERLINE}
          title={S.HEADING}
          subtitle={S.subtitle(shift.businessName, offer.confirmBy)}
        />
        <View>
          <DetailRow
            size="large"
            title={shift.title}
            caption={S.business(shift.businessName, shift.isVerified)}
            onPress={openDetails}
          />
          <DetailRow
            size="large"
            title={offer.dateLabel || shift.dateLabel}
            caption={S.timeRange(
              shift.timeLabel,
              shift.durationHours,
              offer.breakNote,
            )}
            onPress={openDetails}
          />
          <DetailRow
            size="large"
            title={S.AGREED_RATE}
            caption={S.rate(
              formatRupees(shift.hourlyRate),
              formatRupees(shift.hourlyRate * shift.durationHours),
            )}
            onPress={openDetails}
          />
          <DetailRow
            size="large"
            title={S.WORKPLACE}
            caption={S.workplace(workplace, shift.distanceKm)}
            onPress={() =>
              Linking.openURL(mapsUrl(`${shift.businessName}, ${workplace}`))
            }
          />
        </View>
      </FormScreen>
      {isDeclineOpen ? (
        <ReasonSheet
          title={S.DECLINE_TITLE}
          subtitle={S.declineBody(shift.businessName)}
          reasonLabel={S.DECLINE_REASON}
          reasons={DECLINE_REASONS}
          confirmLabel={S.DECLINE}
          keepLabel={S.KEEP}
          onConfirm={decline}
          onClose={() => setIsDeclineOpen(false)}
          testID="decline-offer-sheet"
        />
      ) : null}
    </>
  );
};
