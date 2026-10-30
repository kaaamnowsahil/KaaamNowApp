import { useEffect, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';

import MapPinIcon from '@/assets/figma/map-pin.svg';
import MessageCircleIcon from '@/assets/icons/message-circle.svg';
import TriangleAlertIcon from '@/assets/icons/triangle-alert.svg';
import NavigationIcon from '@/assets/figma/navigation.svg';
import {
  FlowHeading,
  InfoCard,
  ShiftRouteMap,
  StatTiles,
  TextSection,
  type ShiftRoute,
} from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { getDevicePosition } from '@/services/maps/devicePosition';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import {
  useAssignment,
  useShiftAction,
  useWorkerShiftDetail,
} from '@/services/shifts/useShiftFlow';
import { useEmergency } from '@/services/support/useEmergency';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { SHIFT_TRAVEL_STRINGS } from './constants';

const HOUR_MS = 60 * 60 * 1000;
const TRAVEL_OPENS_HOURS_BEFORE = 3;
const CLOCK_TICK_MS = 30 * 1000;
const LOCATION_SHARE_INTERVAL_MS = 60 * 1000;

const clockTime = (ms: number) =>
  new Date(ms)
    .toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
    .toUpperCase();

/**
 * Heading to business, as on web: route map, directions, and "I've arrived" once check-in opens.
 * - data: GET /worker/shifts/{id}, GET /assignments/{id}, GET /assignments/{id}/tracking;
 *   POST /worker/assignments/{id}/start-travel
 */
export const ShiftTravelPage: FC<AppScreenProps<typeof ROUTES.shiftTravel>> = ({
  navigation,
  route,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const detail = useWorkerShiftDetail(route.params.shift);
  const { shift } = detail;
  const assignmentId = shift.assignmentId ?? '';
  const assignment = useAssignment(assignmentId);
  const action = useShiftAction();
  const emergency = useEmergency(assignmentId);
  const [hasStarted, setHasStarted] = useState(false);
  const [routeInfo, setRouteInfo] = useState<ShiftRoute | null>(null);
  const [now, setNow] = useState(Date.now());
  const tracking = useApiQuery(
    async () => (assignmentId ? shiftsApi.tracking(assignmentId) : null),
    [assignmentId],
  );

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  const workplace = detail.data?.workplace_name || shift.businessName;
  const address = shift.addressText || shift.area;
  const status = assignment.data?.status ?? shift.assignmentStatus;
  const isEnRoute = hasStarted || status === 'en_route';

  useEffect(() => {
    if (!isEnRoute) return undefined;
    const share = () =>
      getDevicePosition()
        .then(position => position && shiftsApi.updateLocation(position))
        .catch(() => undefined);
    share();
    const timer = setInterval(share, LOCATION_SHARE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isEnRoute]);

  const startsAt = shift.startsAt ? new Date(shift.startsAt).getTime() : null;
  const endsAt = new Date(assignment.data?.ends_at ?? shift.endsAt ?? 0).getTime();
  const travelOpensAt = startsAt == null ? null : startsAt - TRAVEL_OPENS_HOURS_BEFORE * HOUR_MS;
  const canStartTravel =
    shift.status !== 'scheduled' || travelOpensAt == null || now >= travelOpensAt;
  const checkInOpensAt = assignment.data
    ? new Date(assignment.data.check_in_opens_at).getTime()
    : null;
  const isCheckInOpen = checkInOpensAt != null && now >= checkInOpensAt && now < endsAt;
  const eta = routeInfo?.durationMinutes ?? tracking.data?.eta_minutes;
  const distance = routeInfo?.distanceKm ?? tracking.data?.distance_km ?? shift.distanceKm;
  const destination =
    shift.latitude != null && shift.longitude != null
      ? { latitude: shift.latitude, longitude: shift.longitude }
      : null;

  const openDirections = () =>
    Linking.openURL(
      destination
        ? `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`
        : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            [workplace, address].filter(Boolean).join(', '),
          )}`,
    );

  const primary = () => {
    if (isEnRoute) {
      navigation.navigate(ROUTES.shiftCheckIn, {
        shift: { ...shift, assignmentStatus: 'en_route' },
      });
      return;
    }
    action.run(
      () => shiftsApi.startTravel(assignmentId),
      () => {
        setHasStarted(true);
        assignment.reload();
        openDirections();
      },
      SHIFT_TRAVEL_STRINGS.START_FAILED,
    );
  };

  const primaryLabel = isEnRoute
    ? isCheckInOpen
      ? SHIFT_TRAVEL_STRINGS.ARRIVED
      : SHIFT_TRAVEL_STRINGS.checkInOpensAt(checkInOpensAt ? clockTime(checkInOpensAt) : '—')
    : canStartTravel
      ? SHIFT_TRAVEL_STRINGS.START_NAVIGATION
      : SHIFT_TRAVEL_STRINGS.travelOpensAt(travelOpensAt ? clockTime(travelOpensAt) : '—');
  const primaryDisabled =
    action.busy || !assignmentId || (isEnRoute ? !isCheckInOpen : !canStartTravel);

  const message = () =>
    action.run(
      () => shiftsApi.contact(assignmentId),
      contact => Linking.openURL(`sms:${contact.phone}`),
    );

  return (
    <FormScreen
      busy={action.busy || emergency.busy}
      onBack={navigation.goBack}
      title={t('shiftSecured.headerTitle')}
      compactTitle
      headerTag={t('shiftSecured.headerRight')}
      gap={14}
      isLoading={detail.isLoading || assignment.isLoading}
      testID="shift-travel-page"
      actions={
        <>
          <PrimaryButton
            label={primaryLabel}
            disabled={primaryDisabled}
            onPress={primary}
            testID="shift-travel-primary"
          />
          <SecondaryButton
            label={SHIFT_TRAVEL_STRINGS.MESSAGE}
            icon={MessageCircleIcon}
            disabled={action.busy || !assignmentId}
            onPress={message}
            testID="shift-travel-message"
          />
          <SecondaryButton
            label={SHIFT_TRAVEL_STRINGS.EMERGENCY}
            tone="danger"
            icon={TriangleAlertIcon}
            disabled={emergency.busy || !emergency.isAvailable}
            onPress={emergency.trigger}
            testID="shift-travel-emergency"
          />
        </>
      }
    >
      <FlowHeading
        overline={SHIFT_TRAVEL_STRINGS.OVERLINE}
        title={SHIFT_TRAVEL_STRINGS.heading(workplace)}
        subtitle={startsAt ? SHIFT_TRAVEL_STRINGS.subtitle(clockTime(startsAt)) : undefined}
      />
      <ShiftRouteMap destination={destination} onRoute={setRouteInfo} />
      <StatTiles
        items={[
          {
            value: eta == null ? SHIFT_TRAVEL_STRINGS.NO_ETA : SHIFT_TRAVEL_STRINGS.eta(eta),
            label: SHIFT_TRAVEL_STRINGS.ETA,
          },
          {
            value: SHIFT_TRAVEL_STRINGS.distance(Math.round(distance * 10) / 10),
            label: SHIFT_TRAVEL_STRINGS.DISTANCE,
          },
        ]}
      />
      <Pressable
        accessibilityRole="link"
        onPress={openDirections}
        testID="shift-travel-directions"
        style={({ pressed }) => [
          styles.linkButton,
          {
            borderColor: colors.border,
            backgroundColor: pressed ? colors.primarySoft : colors.surface,
          },
        ]}
      >
        <NavigationIcon width={16} height={16} color={colors.primary} />
        <Text style={[styles.linkLabel, { color: colors.primary }]}>
          {SHIFT_TRAVEL_STRINGS.DIRECTIONS}
        </Text>
      </Pressable>
      <InfoCard
        icon={MapPinIcon}
        title={workplace}
        caption={address}
        onPress={openDirections}
        testID="shift-travel-place"
      />
      {detail.data?.arrival_instructions ? (
        <TextSection
          title={SHIFT_TRAVEL_STRINGS.ARRIVAL_INSTRUCTIONS}
          body={detail.data.arrival_instructions}
        />
      ) : null}
      <Text style={[styles.note, { color: colors.textSubtle }]}>
        {SHIFT_TRAVEL_STRINGS.locationNote(shift.businessName)}
      </Text>
    </FormScreen>
  );
};

/** Web `.booking-link-button`. */
const styles = StyleSheet.create({
  linkButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
  },
  linkLabel: { fontFamily: FONTS.semiBold, fontSize: 14 },
  note: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
});
