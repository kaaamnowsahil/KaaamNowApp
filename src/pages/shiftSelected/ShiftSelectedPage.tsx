import { useState, type FC } from 'react';
import { Alert, Linking, View } from 'react-native';

import ClockIcon from '@/assets/icons/clock.svg';
import { DetailRow, ReasonSheet, StatusHero } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useShiftAction, useWorkerShiftDetail } from '@/services/shifts/useShiftFlow';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';
import { mapsUrl } from '@/utils/links';

import { DECLINE_REASONS, SHIFT_SELECTED_STRINGS } from './constants/shiftSelectedStrings';

/**
 * Scheduled flow step 4. Figma: "Scheduled · You've been selected" (light/dark).
 * Confirming secures the place; declining asks for a reason first (not in Figma).
 * - data: GET /worker/shifts/{id}; confirm/decline via /worker/applications/{id}
 */
export const ShiftSelectedPage: FC<
  AppScreenProps<typeof ROUTES.shiftSelected>
> = ({ navigation, route }) => {
  const detail = useWorkerShiftDetail(route.params.shift);
  const { shift } = detail;
  const action = useShiftAction();
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const workplace = shift.addressText || shift.area;
  const applicationId = shift.applicationId ?? '';

  const openDetails = () =>
    navigation.navigate(ROUTES.shiftDetails, {
      shift,
      bookingStatus: 'selected',
    });

  const confirm = () =>
    action.run(
      () => shiftsApi.confirmSelection(applicationId),
      application =>
        navigation.replace(ROUTES.shiftDetails, {
          shift: {
            ...shift,
            applicationStatus: application.status,
            assignmentId: application.assignment_id ?? shift.assignmentId,
            assignmentStatus: 'confirmed',
          },
          bookingStatus: 'confirmed',
        }),
      SHIFT_SELECTED_STRINGS.CONFIRM_FAILED,
    );

  const decline = () => {
    setIsDeclineOpen(false);
    action.run(
      () => shiftsApi.declineSelection(applicationId),
      () =>
        Alert.alert(SHIFT_SELECTED_STRINGS.DECLINED_TITLE, SHIFT_SELECTED_STRINGS.DECLINED_BODY, [
          {
            text: SHIFT_SELECTED_STRINGS.OK,
            onPress: () =>
              navigation.popTo(ROUTES.mainTabs, { screen: ROUTES.workerShifts }),
          },
        ]),
      SHIFT_SELECTED_STRINGS.DECLINE_FAILED,
    );
  };

  return (
    <>
      <FormScreen
        busy={action.busy}
        onBack={navigation.goBack}
        title={SHIFT_SELECTED_STRINGS.HEADER_TITLE}
        compactTitle
        headerTag={SHIFT_SELECTED_STRINGS.HEADER_TAG}
        gap={20}
        isLoading={detail.isLoading}
        testID="shift-selected-page"
        actions={
          <>
            <PrimaryButton
              label={SHIFT_SELECTED_STRINGS.CONFIRM}
              disabled={action.busy || !applicationId}
              onPress={confirm}
              testID="shift-selected-confirm"
            />
            <SecondaryButton
              label={SHIFT_SELECTED_STRINGS.DECLINE}
              disabled={action.busy || !applicationId}
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
          overline={SHIFT_SELECTED_STRINGS.OVERLINE}
          title={SHIFT_SELECTED_STRINGS.HEADING}
          subtitle={SHIFT_SELECTED_STRINGS.subtitle(
            shift.businessName,
            shift.confirmBy ?? SHIFT_SELECTED_STRINGS.THE_DEADLINE,
          )}
        />
        <View>
          <DetailRow
            size="large"
            title={shift.title}
            caption={SHIFT_SELECTED_STRINGS.business(shift.businessName, shift.isVerified)}
            onPress={openDetails}
          />
          <DetailRow
            size="large"
            title={shift.dateLabel}
            caption={SHIFT_SELECTED_STRINGS.timeRange(
              shift.timeLabel,
              shift.durationHours,
              SHIFT_SELECTED_STRINGS.breakNote(detail.data?.break_minutes ?? 0),
            )}
            onPress={openDetails}
          />
          <DetailRow
            size="large"
            title={SHIFT_SELECTED_STRINGS.AGREED_RATE}
            caption={SHIFT_SELECTED_STRINGS.rate(
              formatRupees(shift.hourlyRate),
              formatRupees(shift.hourlyRate * shift.durationHours),
            )}
            onPress={openDetails}
          />
          <DetailRow
            size="large"
            title={SHIFT_SELECTED_STRINGS.WORKPLACE}
            caption={SHIFT_SELECTED_STRINGS.workplace(workplace, shift.distanceKm)}
            onPress={() =>
              Linking.openURL(mapsUrl(`${shift.businessName}, ${workplace}`))
            }
          />
        </View>
      </FormScreen>
      {isDeclineOpen ? (
        <ReasonSheet
          title={SHIFT_SELECTED_STRINGS.DECLINE_TITLE}
          subtitle={SHIFT_SELECTED_STRINGS.declineBody(shift.businessName)}
          reasonLabel={SHIFT_SELECTED_STRINGS.DECLINE_REASON}
          reasons={DECLINE_REASONS}
          confirmLabel={SHIFT_SELECTED_STRINGS.DECLINE}
          keepLabel={SHIFT_SELECTED_STRINGS.KEEP}
          onConfirm={decline}
          onClose={() => setIsDeclineOpen(false)}
          testID="decline-offer-sheet"
        />
      ) : null}
    </>
  );
};
