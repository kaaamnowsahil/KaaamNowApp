import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, View } from 'react-native';

import { DetailRow, ReasonSheet, StatusHero } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { AppScreenProps } from '@/types';
import { formatRupees, splitTimeRange } from '@/utils/format';
import { mapsUrl } from '@/utils/links';

import { CANCEL_REASONS, DEFAULT_SECURED, SECURED } from './mock';

/**
 * Live step 3 / scheduled step 5. Figma: "Live · Your shift is secured".
 * "Cancel shift" is not in Figma; it opens a ReasonSheet.
 * - data: mock/shiftSecuredMock.ts
 */
export const ShiftSecuredPage: FC<
  AppScreenProps<typeof ROUTES.shiftSecured>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { shift } = route.params;
  const isLoading = useMockLoading();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const secured = { ...DEFAULT_SECURED, ...SECURED[shift.id] };
  const workplace = secured.workplace ?? shift.area;
  const cancelReasons = CANCEL_REASONS.map(reason => ({
    ...reason,
    label: t(`shiftSecured.reasons.${reason.id}`),
  }));

  const openDetails = () => navigation.navigate(ROUTES.shiftDetails, { shift, bookingStatus: 'confirmed' });
  const openMaps = () =>
    Linking.openURL(mapsUrl(`${shift.businessName}, ${workplace}`));

  const cancel = () => {
    setIsCancelOpen(false);
    Alert.alert(t('shiftSecured.cancelledTitle'), t('shiftSecured.cancelledBody'), [
      { text: t('shiftSecured.ok'), onPress: () => navigation.popToTop() },
    ]);
  };

  return (
    <>
      <FormScreen
        onBack={navigation.goBack}
        title={t('shiftSecured.headerTitle')}
        compactTitle
        headerTag={t('shiftSecured.headerRight')}
        gap={16}
        isLoading={isLoading}
        testID="shift-secured-page"
        actions={
          <>
            <PrimaryButton
              label={t('shiftSecured.viewShift')}
              onPress={() => navigation.navigate(ROUTES.shiftTravel, { shift })}
              testID="shift-secured-view"
            />
            <SecondaryButton
              label={t('shiftSecured.directions')}
              onPress={openMaps}
              testID="shift-secured-directions"
            />
            <SecondaryButton
              label={t('shiftSecured.cancelLink')}
              onPress={() => setIsCancelOpen(true)}
              testID="shift-secured-cancel"
            />
          </>
        }
      >
        <StatusHero
          overline={t('shiftSecured.confirmed', { code: secured.checkInCode })}
          title={t('shiftSecured.heading')}
          subtitle={t('shiftSecured.subtitle', {
            minutes: secured.arriveMinutesEarly,
            start: splitTimeRange(shift.timeLabel).start,
            contact: secured.contactName,
          })}
        />
        <View>
          <DetailRow
            size="compact"
            title={shift.title}
            caption={shift.isVerified
              ? t('shiftSecured.verifiedBusiness', { business: shift.businessName })
              : shift.businessName}
            onPress={openDetails}
          />
          <DetailRow
            size="compact"
            title={secured.dateLabel ?? shift.dateLabel}
            caption={t('shiftSecured.timeRange', {
              time: shift.timeLabel,
              hours: shift.durationHours,
            })}
            onPress={openDetails}
          />
          <DetailRow
            size="compact"
            title={t('shiftSecured.agreedRate')}
            caption={t('shiftSecured.rate', {
              rate: formatRupees(shift.hourlyRate),
              total: formatRupees(shift.hourlyRate * shift.durationHours),
            })}
            onPress={openDetails}
          />
          <DetailRow
            size="compact"
            title={t('shiftSecured.workplace')}
            caption={t('shiftSecured.workplaceDistance', {
              address: workplace,
              distance: shift.distanceKm,
            })}
            onPress={openMaps}
          />
        </View>
      </FormScreen>
      {isCancelOpen ? (
        <ReasonSheet
          title={t('shiftSecured.cancelTitle')}
          subtitle={t('shiftSecured.cancelBody', {
            window: secured.lateCancelWindow,
          })}
          reasonLabel={t('shiftSecured.cancelReason')}
          reasons={cancelReasons}
          confirmLabel={t('shiftSecured.cancelConfirm')}
          keepLabel={t('shiftSecured.keep')}
          onConfirm={cancel}
          onClose={() => setIsCancelOpen(false)}
          testID="cancel-shift-sheet"
        />
      ) : null}
    </>
  );
};
