import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import MapPinIcon from '@/assets/figma/map-pin.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';
import ClockIcon from '@/assets/icons/clock.svg';
import KeyRoundIcon from '@/assets/icons/key-round.svg';
import MessageCircleIcon from '@/assets/icons/message-circle.svg';
import NavigationIcon from '@/assets/icons/navigation.svg';
import TriangleAlertIcon from '@/assets/icons/triangle-alert.svg';
import {
  businessIcon,
  BusinessRow,
  FactList,
  FlowHeading,
  InfoCallout,
  InfoCard,
  ReasonSheet,
  StatTiles,
  TermsSheet,
  TextSection,
  WorkerCancellationPolicyCard,
} from '@/components/shiftFlow';
import { WORKER_CANCELLATION_STRINGS } from '@/components/shiftFlow/workerCancellationStrings';
import { PrimaryButton, SecondaryButton, TextButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import {
  CANCEL_REASONS,
  SHIFT_SECURED_STRINGS,
} from '@/pages/shiftSecured/constants/shiftSecuredStrings';
import { ApiError } from '@/services/api/apiClient';
import { getDevicePosition } from '@/services/maps/devicePosition';
import {
  formatDateTime,
  fromMinor,
  isTaskShift,
} from '@/services/shifts/shiftMappers';
import { liveWorkApi } from '@/services/liveWork/liveWorkApi';
import { isLiveWorkNotFound } from '@/services/liveWork/liveWorkFormat';
import { shiftsApi, type CancellationQuote } from '@/services/shifts/shiftsApi';
import {
  useAssignment,
  useShiftAction,
  useWorkerShiftDetail,
} from '@/services/shifts/useShiftFlow';
import { useEmergency } from '@/services/support/useEmergency';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps, BookingStatus, Shift } from '@/types';
import { formatRupees } from '@/utils/format';
import { mapsUrl } from '@/utils/links';

import {
  BOOKING_COPY,
  DETAILS_COPY,
  SHIFT_DETAILS_STRINGS,
  TRAVEL_OPENS_HOURS_BEFORE,
} from './constants';

const HOUR_MS = 3_600_000;

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
  const { colors } = useTheme();
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
        async () => {
          try {
            const live = await liveWorkApi.accept(shift.id);
            return { kind: 'live', assignmentId: live.assignment_id } as const;
          } catch (error) {
            if (!isLiveWorkNotFound(error)) throw error;
          }
          return { kind: 'shift', assignment: await shiftsApi.acceptLive(shift.id) } as const;
        },
        result =>
          result.kind === 'live'
            ? navigation.replace(ROUTES.workerLiveBooking, {
              assignmentId: result.assignmentId,
            })
            : showBooked({
              ...shift,
              assignmentId: result.assignment.id,
              assignmentStatus: result.assignment.status,
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

  const isBooked = bookingStatus === 'confirmed';
  const isCancelled = bookingStatus === 'cancelled';
  const assignment = useAssignment(isBooked || isCancelled ? shift.assignmentId : null);
  const emergency = useEmergency(isBooked ? shift.assignmentId : null);
  const [cancelQuote, setCancelQuote] = useState<CancellationQuote | null>(null);
  const now = Date.now();
  const startsAt = shift.startsAt ? new Date(shift.startsAt).getTime() : now;
  const travelOpensAt = startsAt - TRAVEL_OPENS_HOURS_BEFORE * HOUR_MS;
  const canStartTravel = shift.status !== 'scheduled' || now >= travelOpensAt;
  const checkInOpensAt = assignment.data?.check_in_opens_at;
  const isCheckInOpen =
    Boolean(checkInOpensAt) &&
    now >= new Date(checkInOpensAt as string).getTime() &&
    (!shift.endsAt || now < new Date(shift.endsAt).getTime());
  const workplace = [info?.workplace_name, shift.addressText || shift.area]
    .filter(Boolean)
    .join(', ');
  const a = assignment.data;
  const activity = a
    ? (
      [
        [a.applied_at, SHIFT_DETAILS_STRINGS.activity.APPLIED],
        [a.selected_at, SHIFT_DETAILS_STRINGS.activity.selected(shift.businessName)],
        [
          a.confirmed_at,
          shift.status === 'scheduled'
            ? SHIFT_DETAILS_STRINGS.activity.CONFIRMED
            : SHIFT_DETAILS_STRINGS.activity.ACCEPTED,
        ],
        [a.travel_started_at, SHIFT_DETAILS_STRINGS.activity.ON_THE_WAY],
        [a.attendance?.checked_in_at, SHIFT_DETAILS_STRINGS.activity.CHECKED_IN],
        [a.attendance?.checked_out_at, SHIFT_DETAILS_STRINGS.activity.CHECKED_OUT],
        [a.attendance?.approved_at, SHIFT_DETAILS_STRINGS.activity.approved(shift.businessName)],
        [
          a.cancelled_at,
          a.cancelled_by === 'worker'
            ? SHIFT_DETAILS_STRINGS.activity.WITHDRAWN
            : SHIFT_DETAILS_STRINGS.activity.cancelledByBusiness(shift.businessName),
        ],
      ] as const
    )
      .filter((entry): entry is readonly [string, string] => Boolean(entry[0]))
      .sort(([x], [y]) => new Date(x).getTime() - new Date(y).getTime())
    : [];
  const openDirections = () =>
    Linking.openURL(mapsUrl(`${shift.businessName}, ${shift.addressText || shift.area}`));
  const cancelReasons = CANCEL_REASONS.map(reason => ({
    ...reason,
    label: t(`shiftSecured.reasons.${reason.id}`),
  }));

  const headToBusiness = () =>
    action.run(
      () => shiftsApi.startTravel(shift.assignmentId as string),
      () =>
        navigation.navigate(ROUTES.shiftTravel, {
          shift: { ...shift, assignmentStatus: 'en_route' },
        }),
      SHIFT_DETAILS_STRINGS.TRAVEL_FAILED,
    );
  const openCancel = () =>
    action.run(
      () => shiftsApi.cancelPreview(shift.assignmentId as string),
      setCancelQuote,
      SHIFT_DETAILS_STRINGS.PREVIEW_FAILED,
    );
  const cancel = (reasonId: string) => {
    setCancelQuote(null);
    const reason = cancelReasons.find(item => item.id === reasonId)?.label ?? reasonId;
    action.run(
      () => shiftsApi.cancelAssignment(shift.assignmentId as string, reason),
      () =>
        Alert.alert(t('shiftSecured.cancelledTitle'), t('shiftSecured.cancelledBody'), [
          { text: t('shiftSecured.ok'), onPress: () => navigation.popToTop() },
        ]),
      SHIFT_DETAILS_STRINGS.CANCEL_FAILED,
    );
  };

  const activityCard = activity.length ? (
    <View style={[styles.nextSteps, { borderColor: colors.border }]}>
      <Text style={[styles.nextTitle, { color: colors.text }]}>
        {SHIFT_DETAILS_STRINGS.ACTIVITY}
      </Text>
      {activity.map(([at, label], index) => (
        <View
          key={`${label}-${at}`}
          style={[
            styles.activityRow,
            index > 0 && [styles.activityDivider, { borderTopColor: colors.border }],
          ]}
        >
          <Text style={[styles.activityLabel, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.activityTime, { color: colors.textSubtle }]}>
            {formatDateTime(at)}
          </Text>
        </View>
      ))}
    </View>
  ) : null;

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
        if (isCheckInOpen) {
          return {
            label: SHIFT_DETAILS_STRINGS.CHECK_IN,
            onPress: () => navigation.navigate(ROUTES.shiftCheckIn, { shift }),
          };
        }
        return canStartTravel
          ? { label: SHIFT_DETAILS_STRINGS.HEAD_TO_BUSINESS, onPress: headToBusiness }
          : {
            label: SHIFT_DETAILS_STRINGS.travelOpensAt(formatDateTime(new Date(travelOpensAt).toISOString())),
            isDisabled: true,
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
            {isBooked ? (
              <SecondaryButton
                label={SHIFT_DETAILS_STRINGS.DIRECTIONS}
                icon={NavigationIcon}
                onPress={openDirections}
                testID="shift-details-directions"
              />
            ) : null}
            {shift.assignmentId && !isCancelled ? (
              <SecondaryButton
                label={SHIFT_DETAILS_STRINGS.MESSAGE}
                icon={MessageCircleIcon}
                disabled={action.busy}
                onPress={messageBusiness}
                testID="shift-details-message"
              />
            ) : null}
            {isBooked ? (
              <SecondaryButton
                label={SHIFT_DETAILS_STRINGS.EMERGENCY}
                tone="danger"
                icon={TriangleAlertIcon}
                disabled={emergency.busy || !emergency.isAvailable}
                onPress={emergency.trigger}
                testID="shift-details-emergency"
              />
            ) : null}
          </>
        }
      >
        <FlowHeading
          overline={
            (isCancelled && a?.cancelled_by === 'worker'
              ? SHIFT_DETAILS_STRINGS.WITHDRAWN
              : booking?.overline) ??
            (hasTimeConflict
              ? SHIFT_DETAILS_STRINGS.timeConflict(shift.status === 'live')
              : copy.overline(Math.max(shift.spotsOpen, 1)))
          }
          tone={
            booking?.tone ??
            (hasTimeConflict ? 'danger' : shift.status === 'scheduled' ? 'success' : 'primary')
          }
          isPill={shift.status === 'scheduled'}
          isCaps={shift.status === 'live'}
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
          items={
            isTaskShift(shift)
              ? [
                  {
                    value: formatRupees(shift.estimatedPay ?? 0),
                    label: t('taskPricing.fixedPrice'),
                  },
                ]
              : [
                  { value: SHIFT_DETAILS_STRINGS.rate(rate), label: SHIFT_DETAILS_STRINGS.AGREED_RATE },
                  {
                    value: formatRupees(shift.estimatedPay ?? shift.hourlyRate * shift.durationHours),
                    label: SHIFT_DETAILS_STRINGS.ESTIMATED,
                  },
                ]
          }
        />

        {shift.status === 'scheduled' ? (
          <View style={styles.cards}>
            <InfoCard
              icon={CalendarIcon}
              title={SHIFT_DETAILS_STRINGS.when(shift.dateLabel, shift.timeLabel)}
              caption={
                isTaskShift(shift)
                  ? t('taskPricing.taskNote')
                  : SHIFT_DETAILS_STRINGS.scheduledDuration(
                      shift.durationHours,
                      info?.break_minutes ?? 0,
                    )
              }
            />
            <InfoCard
              icon={MapPinIcon}
              title={isBooked ? workplace : shift.addressText || shift.area}
              caption={t('shiftDetails.distance', { distance: shift.distanceKm })}
              onPress={isBooked ? openDirections : undefined}
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

        {isBooked ? (
          <View style={[styles.nextSteps, { borderColor: colors.border }]}>
            <Text style={[styles.nextTitle, { color: colors.text }]}>
              {SHIFT_DETAILS_STRINGS.NEXT_STEPS}
            </Text>
            <FactList
              accentIcons
              items={[
                ...(shift.status === 'scheduled'
                  ? [{
                    icon: NavigationIcon,
                    text: SHIFT_DETAILS_STRINGS.travelStep(
                      formatDateTime(new Date(travelOpensAt).toISOString()),
                    ),
                  }]
                  : []),
                ...(checkInOpensAt
                  ? [{
                    icon: KeyRoundIcon,
                    text: SHIFT_DETAILS_STRINGS.checkInStep(formatDateTime(checkInOpensAt)),
                  }]
                  : []),
                { icon: ClockIcon, text: SHIFT_DETAILS_STRINGS.CHECK_OUT_STEP },
              ]}
            />
          </View>
        ) : null}
        <TextSection
          title={SHIFT_DETAILS_STRINGS.WHAT_YOU_DO}
          body={info?.responsibilities || SHIFT_DETAILS_STRINGS.NO_DETAILS}
        />
        {info?.requirements && !isBooked ? (
          <TextSection
            title={SHIFT_DETAILS_STRINGS.BEFORE_ACCEPT}
            body={info.requirements}
            variant="note"
          />
        ) : null}
        {isBooked ? null : (
          <InfoCallout
            text={copy.callout}
            variant={shift.status === 'scheduled' ? 'accent' : 'box'}
          />
        )}
        <WorkerCancellationPolicyCard onReadTerms={() => navigation.navigate(ROUTES.terms)} />
        {isBooked && shift.assignmentId ? (
          <TextButton
            label={SHIFT_DETAILS_STRINGS.WITHDRAW}
            tone="danger"
            onPress={openCancel}
            testID="shift-details-withdraw"
          />
        ) : null}
        {activityCard}
      </FormScreen>
      {cancelQuote ? (
        <ReasonSheet
          title={t('shiftSecured.cancelTitle')}
          subtitle={
            cancelQuote.fee_minor > 0
              ? SHIFT_SECURED_STRINGS.feeCancel(
                formatRupees(fromMinor(cancelQuote.fee_minor)),
                cancelQuote.strike_weight,
              )
              : SHIFT_SECURED_STRINGS.FREE_CANCEL
          }
          reasonLabel={t('shiftSecured.cancelReason')}
          reasons={cancelReasons}
          confirmLabel={t('shiftSecured.cancelConfirm')}
          keepLabel={t('shiftSecured.keep')}
          onConfirm={cancel}
          onClose={() => setCancelQuote(null)}
          testID="cancel-shift-sheet"
        />
      ) : null}
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
  nextSteps: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  nextTitle: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 20 },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  activityDivider: { borderTopWidth: 1, borderStyle: 'dashed', paddingTop: 8 },
  activityLabel: { flex: 1, fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
  activityTime: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
});
