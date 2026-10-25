import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, View } from 'react-native';

import { DetailRow, ReasonSheet, StatusHero } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import {
  bookingRef,
  useShiftAction,
  useWorkerShiftDetail,
} from '@/services/shifts/useShiftFlow';
import type { AppScreenProps } from '@/types';
import { formatRupees, splitTimeRange } from '@/utils/format';
import { mapsUrl } from '@/utils/links';

import { CANCEL_REASONS, SHIFT_SECURED_STRINGS } from './constants/shiftSecuredStrings';

/**
 * Live step 3 / scheduled step 5. Figma: "Live · Your shift is secured".
 * "Cancel shift" is not in Figma; it opens a ReasonSheet.
 * - data: GET /worker/shifts/{id}; cancel via POST /worker/assignments/{id}/cancel
 */
export const ShiftSecuredPage: FC<
  AppScreenProps<typeof ROUTES.shiftSecured>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const detail = useWorkerShiftDetail(route.params.shift);
  const { shift } = detail;
  const action = useShiftAction();
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const workplace = shift.addressText || shift.area;
  const contactName = detail.data?.site_contact_name || SHIFT_SECURED_STRINGS.SHIFT_LEAD;
  const cancelReasons = CANCEL_REASONS.map(reason => ({
    ...reason,
    label: t(`shiftSecured.reasons.${reason.id}`),
  }));

  const openDetails = () => navigation.navigate(ROUTES.shiftDetails, { shift, bookingStatus: 'confirmed' });
  const openMaps = () =>
    Linking.openURL(mapsUrl(`${shift.businessName}, ${workplace}`));

  const cancel = (reasonId: string) => {
    setIsCancelOpen(false);
    if (!shift.assignmentId) return;
    const reason = cancelReasons.find(item => item.id === reasonId)?.label ?? reasonId;
    action.run(
      () => shiftsApi.cancelAssignment(shift.assignmentId as string, reason),
      () =>
        Alert.alert(t('shiftSecured.cancelledTitle'), t('shiftSecured.cancelledBody'), [
          { text: t('shiftSecured.ok'), onPress: () => navigation.popToTop() },
        ]),
      SHIFT_SECURED_STRINGS.CANCEL_FAILED,
    );
  };

  return (
    <>
      <FormScreen
        busy={action.busy}
        onBack={navigation.goBack}
        title={t('shiftSecured.headerTitle')}
        compactTitle
        headerTag={t('shiftSecured.headerRight')}
        gap={16}
        isLoading={detail.isLoading}
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
              disabled={action.busy || !shift.assignmentId}
              onPress={() => setIsCancelOpen(true)}
              testID="shift-secured-cancel"
            />
          </>
        }
      >
        <StatusHero
          overline={t('shiftSecured.confirmed', { code: bookingRef(shift.assignmentId) })}
          title={t('shiftSecured.heading')}
          subtitle={t('shiftSecured.subtitle', {
            minutes: SHIFT_SECURED_STRINGS.ARRIVE_MINUTES_EARLY,
            start: splitTimeRange(shift.timeLabel).start,
            contact: contactName,
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
            title={shift.dateLabel}
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
            window: SHIFT_SECURED_STRINGS.lateCancelWindow(
              detail.data?.cancellation_cutoff_hours ?? 12,
            ),
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
