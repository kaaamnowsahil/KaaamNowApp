import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import MapPinIcon from '@/assets/figma/map-pin.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';
import ClockIcon from '@/assets/icons/clock.svg';
import {
  businessIcon,
  BusinessRow,
  FactList,
  FlowHeading,
  InfoCallout,
  StatTiles,
  TextSection,
} from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { getDevicePosition } from '@/services/maps/devicePosition';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useShiftAction, useWorkerShiftDetail } from '@/services/shifts/useShiftFlow';
import type { AppScreenProps, BookingStatus, Shift } from '@/types';
import { formatRupees } from '@/utils/format';

import {
  BOOKING_COPY,
  DETAILS_COPY,
  SHIFT_DETAILS_STRINGS,
} from './constants';

/** Booking state from the API when the screen was opened without one. */
const bookingFromShift = (shift: Shift): BookingStatus | undefined => {
  if (shift.applicationStatus === 'selected') return 'selected';
  if (shift.applicationStatus === 'applied') return 'applied';
  if (shift.assignmentStatus === 'cancelled') return 'cancelled';
  if (shift.assignmentStatus === 'checked_out' || shift.assignmentStatus === 'approved') {
    return 'completed';
  }
  if (shift.assignmentId) return 'confirmed';
  return undefined;
};

/**
 * Step 2 of both worker flows. Figma: "Live · Café service associate" and
 * "Scheduled · Event service associate". With a bookingStatus (from My shifts)
 * the overline and primary action follow the booking instead.
 * - data: GET /worker/shifts/{id}
 */
export const ShiftDetailsPage: FC<
  AppScreenProps<typeof ROUTES.shiftDetails>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const detail = useWorkerShiftDetail(route.params.shift);
  const { shift } = detail;
  const info = detail.data;
  const action = useShiftAction();
  const bookingStatus = route.params.bookingStatus ?? bookingFromShift(shift);
  const copy = DETAILS_COPY[shift.status];
  const booking = bookingStatus ? BOOKING_COPY[bookingStatus] : undefined;
  const rate = formatRupees(shift.hourlyRate);

  const accept = () =>
    shift.status === 'live'
      ? action.run(
        () => shiftsApi.acceptLive(shift.id),
        assignment =>
          navigation.replace(ROUTES.shiftSecured, {
            shift: { ...shift, assignmentId: assignment.id, assignmentStatus: assignment.status },
          }),
        SHIFT_DETAILS_STRINGS.ACCEPT_FAILED,
      )
      : action.run(
        async () => shiftsApi.apply(shift.id, (await getDevicePosition(5000)) ?? undefined),
        application =>
          navigation.replace(ROUTES.applicationSubmitted, {
            shift: {
              ...shift,
              applicationId: application.id,
              applicationStatus: application.status,
            },
          }),
        SHIFT_DETAILS_STRINGS.APPLY_FAILED,
      );

  const messageBusiness = () =>
    shift.assignmentId &&
    action.run(
      () => shiftsApi.contact(shift.assignmentId as string),
      contact => Linking.openURL(`sms:${contact.phone}`),
      SHIFT_DETAILS_STRINGS.CONTACT_FAILED,
    );

  const primary = (() => {
    switch (bookingStatus) {
      case undefined:
        return { label: copy.accept(rate), onPress: accept };
      case 'selected':
        return {
          label: booking?.action,
          onPress: () => navigation.popTo(ROUTES.shiftSelected, { shift }),
        };
      case 'confirmed':
        return {
          label: booking?.action,
          onPress: () => navigation.popTo(ROUTES.shiftSecured, { shift }),
        };
      case 'applied':
        return { label: booking?.action, isDisabled: true };
      default:
        return undefined;
    }
  })();

  return (
    <FormScreen
      busy={action.busy}
      onBack={navigation.goBack}
      title={SHIFT_DETAILS_STRINGS.HEADER_TITLE}
      compactTitle
      headerTag={SHIFT_DETAILS_STRINGS.HEADER_TAG}
      gap={14}
      isLoading={detail.isLoading}
      testID="shift-details-page"
      actions={
        <>
          {primary?.label ? (
            <PrimaryButton
              label={primary.label}
              disabled={primary.isDisabled || action.busy}
              onPress={primary.onPress}
              testID="shift-details-primary"
            />
          ) : null}
          {shift.assignmentId ? (
            <SecondaryButton
              label={SHIFT_DETAILS_STRINGS.MESSAGE}
              disabled={action.busy}
              onPress={messageBusiness}
              testID="shift-details-message"
            />
          ) : null}
        </>
      }
    >
      <FlowHeading
        overline={booking?.overline ?? copy.overline(Math.max(shift.spotsOpen, 1))}
        tone={booking?.tone ?? 'primary'}
        title={shift.title}
      />

      <BusinessRow
        icon={businessIcon(shift.businessTypeId)}
        name={shift.businessName}
        meta={SHIFT_DETAILS_STRINGS.businessMeta(
          shift.isVerified,
          info?.business.rating_avg ?? 0,
          info?.business.rating_count ?? 0,
        )}
        isVerified={shift.isVerified}
      />

      <StatTiles
        items={[
          { value: SHIFT_DETAILS_STRINGS.rate(rate), label: SHIFT_DETAILS_STRINGS.AGREED_RATE },
          {
            value: formatRupees(shift.hourlyRate * shift.durationHours),
            label: SHIFT_DETAILS_STRINGS.ESTIMATED,
          },
        ]}
      />

      <FactList
        items={[
          { icon: CalendarIcon, text: SHIFT_DETAILS_STRINGS.when(shift.dateLabel, shift.timeLabel) },
          {
            icon: ClockIcon,
            text: `${t('shiftDetails.duration', { hours: shift.durationHours })} · ${SHIFT_DETAILS_STRINGS.breakNote(info?.break_minutes ?? 0)}`,
          },
          {
            icon: MapPinIcon,
            text: `${shift.addressText || shift.area} · ${t('shiftDetails.distance', { distance: shift.distanceKm })}`,
          },
        ]}
      />

      <TextSection
        title={SHIFT_DETAILS_STRINGS.WHAT_YOU_DO}
        body={info?.responsibilities || SHIFT_DETAILS_STRINGS.NO_DETAILS}
      />
      {info?.requirements ? (
        <TextSection
          title={SHIFT_DETAILS_STRINGS.BEFORE_ACCEPT}
          body={info.requirements}
          variant="note"
        />
      ) : null}
      <InfoCallout text={copy.callout} />
      <TextSection
        title={SHIFT_DETAILS_STRINGS.CANCELLATION}
        body={SHIFT_DETAILS_STRINGS.cancellation(info?.cancellation_cutoff_hours ?? 12)}
        variant="fine"
      />
    </FormScreen>
  );
};
