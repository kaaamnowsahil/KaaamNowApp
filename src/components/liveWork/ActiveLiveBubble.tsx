import {
  useNavigation,
  useNavigationState,
  type NavigationState,
  type PartialState,
} from '@react-navigation/native';
import { useEffect, useRef, useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { BottomSheet } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { liveWorkApi } from '@/services/liveWork/liveWorkApi';
import { formatClock } from '@/services/liveWork/liveWorkFormat';
import {
  BUSINESS_LIVE_STATUS,
  LIVE_TEXT as S,
} from '@/services/liveWork/liveWorkStrings';
import type { BusinessLiveBooking } from '@/services/liveWork/liveWorkTypes';
import { useCountdown } from '@/services/liveWork/useLivePolling';
import { useTheme } from '@/theme/ThemeProvider';
import type { TabAppNavigation } from '@/types';

const REFRESH_MS = 20_000;
const EDGE = 16;
/** Starts above the bottom tabs and the dashboard's bottom action. */
const START_BOTTOM = 170;

type AnyState = NavigationState | PartialState<NavigationState>;
type FocusedRoute = { name: string; params?: object };

const focusedRoute = (
  state: AnyState | undefined,
): FocusedRoute | undefined => {
  if (!state?.routes?.length) return undefined;
  const route = state.routes[state.index ?? state.routes.length - 1];
  return route.state ? focusedRoute(route.state as AnyState) : route;
};

/**
 * Floating, draggable shortcut back to the Business's active Live Work bookings. One booking
 * opens directly; several open a picker. The booking whose screen is open is left out.
 */
export const ActiveLiveBubble: FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<TabAppNavigation>();
  const { width } = useWindowDimensions();
  const current = useNavigationState(state => focusedRoute(state));
  const [bookings, setBookings] = useState<BusinessLiveBooking[]>([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [bubbleWidth, setBubbleWidth] = useState(0);
  const pan = useRef(new Animated.ValueXY()).current;
  const snapLeft = useRef(0);
  const restX = useRef(0);
  const pulse = useRef(new Animated.Value(1)).current;
  snapLeft.current = -(width - bubbleWidth - EDGE * 2);

  const openBookingId =
    current?.name === ROUTES.businessLiveWork
      ? (current.params as { bookingId?: string } | undefined)?.bookingId
      : undefined;
  const others = bookings.filter(item => item.booking_id !== openBookingId);
  const booking = others.length === 1 ? others[0] : null;

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      liveWorkApi
        .list(true)
        .then(page => !cancelled && setBookings(page.items))
        .catch(() => undefined);
    load();
    const timer = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [current?.name]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const responder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        pan.extractOffset();
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        pan.flattenOffset();
        const x = restX.current + g.dx;
        restX.current =
          x + g.vx * 100 < snapLeft.current / 2 ? snapLeft.current : 0;
        Animated.spring(pan.x, {
          toValue: restX.current,
          useNativeDriver: false,
        }).start();
      },
    }),
  ).current;

  const deadline =
    booking?.status === 'searching'
      ? booking.search?.expires_at
      : booking?.status === 'in_progress'
      ? booking.timer?.ends_at
      : null;
  const left = useCountdown(deadline, booking?.server_time);

  if (!others.length) return null;

  const status = booking
    ? BUSINESS_LIVE_STATUS[booking.status] ?? booking.status
    : S.myLiveWork;
  const title = booking
    ? left != null
      ? `${S.trackTitle} · ${formatClock(left)}`
      : S.trackTitle
    : `${S.trackTitle} · ${others.length}`;
  const openBooking = (bookingId: string) => {
    setIsPickerOpen(false);
    navigation.navigate(ROUTES.mainTabs, {
      screen: ROUTES.businessLive,
      params: {
        screen: ROUTES.businessLiveWork,
        params: { bookingId },
      } as never,
    });
  };
  const open = () =>
    booking ? openBooking(booking.booking_id) : setIsPickerOpen(true);

  return (
    <>
      <Animated.View
        {...responder.panHandlers}
        onLayout={event => setBubbleWidth(event.nativeEvent.layout.width)}
        style={[styles.root, { transform: pan.getTranslateTransform() }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${S.trackTitle}: ${status}`}
          onPress={open}
          style={[
            styles.bubble,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
          ]}
          testID="active-live-bubble"
        >
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: colors.onPrimary, opacity: pulse },
            ]}
          />
          <View>
            <Text style={[styles.title, { color: colors.onPrimary }]}>
              {title}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.status, { color: colors.onPrimary }]}
            >
              {status}
            </Text>
          </View>
        </Pressable>
      </Animated.View>
      {isPickerOpen ? (
        <BottomSheet
          title={S.myLiveWork}
          onClose={() => setIsPickerOpen(false)}
          closeLabel={t('common.close')}
          testID="active-live-picker"
        >
          <View style={styles.list}>
            {others.map(item => (
              <BookingRow
                key={item.booking_id}
                booking={item}
                onPress={() => openBooking(item.booking_id)}
              />
            ))}
          </View>
        </BottomSheet>
      ) : null}
    </>
  );
};

/** One active booking in the picker: title, status and its own countdown. */
const BookingRow: FC<{ booking: BusinessLiveBooking; onPress: () => void }> = ({
  booking,
  onPress,
}) => {
  const { colors } = useTheme();
  const deadline =
    booking.status === 'searching'
      ? booking.search?.expires_at
      : booking.status === 'in_progress'
      ? booking.timer?.ends_at
      : null;
  const left = useCountdown(deadline, booking.server_time);
  const status = BUSINESS_LIVE_STATUS[booking.status] ?? booking.status;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      testID={`active-live-${booking.booking_id}`}
    >
      <View style={[styles.rowDot, { backgroundColor: colors.primary }]} />
      <View style={styles.rowText}>
        <Text
          numberOfLines={1}
          style={[styles.rowTitle, { color: colors.text }]}
        >
          {booking.work.job_title}
        </Text>
        <Text style={[styles.rowStatus, { color: colors.textMuted }]}>
          {left != null ? `${status} · ${formatClock(left)}` : status}
        </Text>
      </View>
      <Text style={[styles.rowAction, { color: colors.primary }]}>
        {S.openLiveWork}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  root: { position: 'absolute', right: EDGE, bottom: START_BOTTOM },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 220,
    borderRadius: 999,
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: 18,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  list: { gap: 10, marginTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  rowDot: { width: 8, height: 8, borderRadius: 4 },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 21 },
  rowStatus: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  rowAction: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
  title: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
  status: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    lineHeight: 15,
    opacity: 0.9,
  },
});
