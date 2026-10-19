import { useState, type FC } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { DetailRow, StatusHero } from '@/components/liveShift';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';
import { mapsUrl } from '@/utils/links';

import { CancelShiftSheet } from './components';
import { SHIFT_SECURED_STRINGS as S } from './constants';
import { CANCEL_REASONS, SECURED } from './mock';

/**
 * Live shift step 3. Figma: Live · Your shift is secured (light/dark).
 * "Cancel shift" is not in Figma; it opens CancelShiftSheet.
 * - data: mock/shiftSecuredMock.ts
 */
export const ShiftSecuredPage: FC<
  AppScreenProps<typeof ROUTES.shiftSecured>
> = ({ navigation, route }) => {
  const { shift } = route.params;
  const { colors } = useTheme();
  const isLoading = useMockLoading();
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const openDetails = () => navigation.navigate(ROUTES.liveDetails, { shift });
  const openMaps = () =>
    Linking.openURL(mapsUrl(`${shift.businessName}, ${SECURED.workplace}`));

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
        headerRight={
          <Text style={[styles.headerRight, { color: colors.textSubtle }]}>
            {S.HEADER_RIGHT}
          </Text>
        }
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
              tone="danger"
              onPress={() => setIsCancelOpen(true)}
              testID="shift-secured-cancel"
            />
          </>
        }
      >
        <StatusHero
          overline={S.confirmed(SECURED.checkInCode)}
          title={S.HEADING}
          subtitle={S.subtitle(
            SECURED.arriveMinutesEarly,
            SECURED.startTime,
            SECURED.contactName,
          )}
        />
        <View>
          <DetailRow
            compact
            title={shift.title}
            caption={S.business(shift.businessName, shift.isVerified)}
            onPress={openDetails}
          />
          <DetailRow
            compact
            title={SECURED.dateLabel}
            caption={S.timeRange(shift.timeLabel, shift.durationHours)}
            onPress={openDetails}
          />
          <DetailRow
            compact
            title={S.AGREED_RATE}
            caption={S.rate(
              formatRupees(shift.hourlyRate),
              formatRupees(shift.hourlyRate * shift.durationHours),
            )}
            onPress={openDetails}
          />
          <DetailRow
            compact
            title={S.WORKPLACE}
            caption={S.workplace(SECURED.workplace, shift.distanceKm)}
            onPress={openMaps}
          />
        </View>
      </FormScreen>
      {isCancelOpen ? (
        <CancelShiftSheet
          reasons={CANCEL_REASONS}
          lateWindow={SECURED.lateCancelWindow}
          onConfirm={cancel}
          onClose={() => setIsCancelOpen(false)}
        />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  headerRight: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
});
