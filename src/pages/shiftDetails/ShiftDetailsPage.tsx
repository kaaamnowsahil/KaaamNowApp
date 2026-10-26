import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import MapPinIcon from '@/assets/figma/map-pin.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';
import ClockIcon from '@/assets/icons/clock.svg';
import {
  businessIcon,
  BusinessRow,
  FactList,
  FlowHeading,
  InfoCallout,
  InfoCard,
  StatTiles,
  TermsSheet,
  TextSection,
  WorkerCancellationPolicyCard,
} from '@/components/shiftFlow';
import { WORKER_CANCELLATION_STRINGS } from '@/components/shiftFlow/workerCancellationStrings';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { ApiError } from '@/services/api/apiClient';
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
  const hasTimeConflict = !bookingStatus && Boolean(info?.has_time_conflict);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const needsTerms = (error: unknown) => {
    const isTerms = error instanceof ApiError && error.code === 'terms_required';
    if (isTerms) setIsTermsOpen(true);
    return isTerms;
  };

  const [isBookSheetOpen, setIsBookSheetOpen] = useState(false);
  const showBooked = (booked: Shift) => {
    navigation.setParams({ shift: booked, bookingStatus: 'confirmed' });
    detail.reload();
  };

  const accept = () =>
    shift.status === 'live'
      ? action.run(
        () => shiftsApi.acceptLive(shift.id),
        assignment =>
          showBooked({
            ...shift,
            assignmentId: assignment.id,
            assignmentStatus: assignment.status,
          }),
        SHIFT_DETAILS_STRINGS.ACCEPT_FAILED,
        needsTerms,
      )
      : action.run(
        async () => shiftsApi.apply(shift.id, (await getDevicePosition(5000)) ?? undefined),
        application =>
          showBooked({
            ...shift,
            applicationId: application.id,
            applicationStatus: application.status,
            assignmentId: application.assignment_id ?? undefined,
            assignmentStatus: 'confirmed',
          }),
        SHIFT_DETAILS_STRINGS.APPLY_FAILED,
        needsTerms,
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
        return hasTimeConflict
          ? { label: SHIFT_DETAILS_STRINGS.TIME_CONFLICT_ACTION, isDisabled: true }
          : { label: copy.accept(rate), onPress: () => setIsBookSheetOpen(true) };
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
    <>
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
          overline={
            booking?.overline ??
            (hasTimeConflict
              ? SHIFT_DETAILS_STRINGS.timeConflict(shift.status === 'live')
              : copy.overline(Math.max(shift.spotsOpen, 1)))
          }
          tone={
            booking?.tone ??
            (hasTimeConflict ? 'danger' : shift.status === 'scheduled' ? 'success' : 'primary')
          }
          isPill={shift.status === 'scheduled'}
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

        {shift.status === 'scheduled' ? (
          <View style={styles.cards}>
            <InfoCard
              title={SHIFT_DETAILS_STRINGS.when(shift.dateLabel, shift.timeLabel)}
              caption={SHIFT_DETAILS_STRINGS.scheduledDuration(
                shift.durationHours,
                info?.break_minutes ?? 0,
              )}
            />
            <InfoCard
              icon={MapPinIcon}
              title={shift.addressText || shift.area}
              caption={t('shiftDetails.distance', { distance: shift.distanceKm })}
            />
          </View>
        ) : (
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
        )}

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
        <InfoCallout
          text={copy.callout}
          variant={shift.status === 'scheduled' ? 'accent' : 'box'}
        />
        <WorkerCancellationPolicyCard onReadTerms={() => navigation.navigate(ROUTES.terms)} />
      </FormScreen>
      {isBookSheetOpen || isTermsOpen ? (
        <TermsSheet
          audience="worker"
          title={
            shift.status === 'live'
              ? copy.accept(rate)
              : WORKER_CANCELLATION_STRINGS.BOOK_SHEET_TITLE
          }
          body={WORKER_CANCELLATION_STRINGS.BOOK_SHEET_BODY}
          acceptLabel={WORKER_CANCELLATION_STRINGS.BOOK_SHEET_ACCEPT}
          readLabel={WORKER_CANCELLATION_STRINGS.BOOK_SHEET_READ}
          onRead={() => navigation.navigate(ROUTES.terms)}
          onClose={() => {
            setIsBookSheetOpen(false);
            setIsTermsOpen(false);
          }}
          onAccepted={() => {
            setIsBookSheetOpen(false);
            setIsTermsOpen(false);
            accept();
          }}
        />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  cards: { gap: 10 },
});
