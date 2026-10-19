import { useState, type FC } from 'react';
import { Alert, Linking, View } from 'react-native';

import { DetailRow, ReasonSheet, StatusHero } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { AppScreenProps } from '@/types';
import { formatRupees, splitTimeRange } from '@/utils/format';
import { mapsUrl } from '@/utils/links';

import { SHIFT_SECURED_STRINGS as S } from './constants';
import { CANCEL_REASONS, DEFAULT_SECURED, SECURED } from './mock';

/**
 * Live step 3 / scheduled step 5. Figma: "Live · Your shift is secured".
 * "Cancel shift" is not in Figma; it opens a ReasonSheet.
 * - data: mock/shiftSecuredMock.ts
 */
export const ShiftSecuredPage: FC<
  AppScreenProps<typeof ROUTES.shiftSecured>
> = ({ navigation, route }) => {
  const { shift } = route.params;
  const isLoading = useMockLoading();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const secured = { ...DEFAULT_SECURED, ...SECURED[shift.id] };
  const workplace = secured.workplace ?? shift.area;

  const openDetails = () => navigation.navigate(ROUTES.shiftDetails, { shift, bookingStatus: 'confirmed' });
  const openMaps = () =>
    Linking.openURL(mapsUrl(`${shift.businessName}, ${workplace}`));

  const cancel = () => {
    setIsCancelOpen(false);
    Alert.alert(S.CANCELLED_TITLE, S.CANCELLED_BODY, [
      { text: S.OK, onPress: () => navigation.popToTop() },
    ]);
  };

  return (
    <>
      <FormScreen
        onBack={navigation.goBack}
        title={S.HEADER_TITLE}
        compactTitle
        headerTag={S.HEADER_RIGHT}
        gap={16}
        isLoading={isLoading}
        testID="shift-secured-page"
        actions={
          <>
            <PrimaryButton
              label={S.VIEW_SHIFT}
              onPress={() => navigation.navigate(ROUTES.shiftTravel, { shift })}
              testID="shift-secured-view"
            />
            <SecondaryButton
              label={S.DIRECTIONS}
              onPress={openMaps}
              testID="shift-secured-directions"
            />
            <SecondaryButton
              label={S.CANCEL_LINK}
              onPress={() => setIsCancelOpen(true)}
              testID="shift-secured-cancel"
            />
          </>
        }
      >
        <StatusHero
          overline={S.confirmed(secured.checkInCode)}
          title={S.HEADING}
          subtitle={S.subtitle(
            secured.arriveMinutesEarly,
            splitTimeRange(shift.timeLabel).start,
            secured.contactName,
          )}
        />
        <View>
          <DetailRow
            size="compact"
            title={shift.title}
            caption={S.business(shift.businessName, shift.isVerified)}
            onPress={openDetails}
          />
          <DetailRow
            size="compact"
            title={secured.dateLabel ?? shift.dateLabel}
            caption={S.timeRange(shift.timeLabel, shift.durationHours)}
            onPress={openDetails}
          />
          <DetailRow
            size="compact"
            title={S.AGREED_RATE}
            caption={S.rate(
              formatRupees(shift.hourlyRate),
              formatRupees(shift.hourlyRate * shift.durationHours),
            )}
            onPress={openDetails}
          />
          <DetailRow
            size="compact"
            title={S.WORKPLACE}
            caption={S.workplace(workplace, shift.distanceKm)}
            onPress={openMaps}
          />
        </View>
      </FormScreen>
      {isCancelOpen ? (
        <ReasonSheet
          title={S.CANCEL_TITLE}
          subtitle={S.cancelBody(secured.lateCancelWindow)}
          reasonLabel={S.CANCEL_REASON}
          reasons={CANCEL_REASONS}
          confirmLabel={S.CANCEL_CONFIRM}
          keepLabel={S.KEEP}
          onConfirm={cancel}
          onClose={() => setIsCancelOpen(false)}
          testID="cancel-shift-sheet"
        />
      ) : null}
    </>
  );
};
