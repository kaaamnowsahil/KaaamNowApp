import type { FC } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import BadgeCheckIcon from '@/assets/figma/badge-check.svg';
import MapPinIcon from '@/assets/figma/map-pin.svg';
import CalendarIcon from '@/assets/icons/calendar.svg';
import ClockIcon from '@/assets/icons/clock.svg';
import CoffeeIcon from '@/assets/icons/coffee.svg';
import { InfoCallout, StatTiles } from '@/components/liveShift';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import { LIVE_DETAILS_STRINGS as S } from './constants';
import { DEFAULT_LIVE_DETAILS, LIVE_DETAILS } from './mock';

/**
 * Live shift step 2. Figma: Live · Café service associate (light/dark).
 * Accepting replaces this screen with "Shift secured".
 * - data: mock/liveDetailsMock.ts
 */
export const LiveDetailsPage: FC<AppScreenProps<typeof ROUTES.liveDetails>> = ({
  navigation,
  route,
}) => {
  const { shift } = route.params;
  const { colors } = useTheme();
  const isLoading = useMockLoading();
  const d = LIVE_DETAILS[shift.id] ?? DEFAULT_LIVE_DETAILS;
  const rate = formatRupees(shift.hourlyRate);

  const facts = [
    { icon: CalendarIcon, text: S.when(shift.dateLabel, shift.timeLabel) },
    { icon: ClockIcon, text: S.duration(shift.durationHours, d.startsIn) },
    { icon: MapPinIcon, text: S.where(d.placeLabel, shift.distanceKm) },
  ];

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={S.HEADER_TITLE}
      compactTitle
      headerRight={
        <Text style={[styles.headerRight, { color: colors.textSubtle }]}>
          {S.HEADER_RIGHT}
        </Text>
      }
      gap={14}
      isLoading={isLoading}
      testID="live-details-page"
      actions={
        <>
          <PrimaryButton
            label={S.accept(rate)}
            onPress={() => navigation.replace(ROUTES.shiftSecured, { shift })}
            testID="live-details-accept"
          />
          <SecondaryButton
            label={S.MESSAGE}
            onPress={() => Linking.openURL(`sms:${d.businessPhone}`)}
            testID="live-details-message"
          />
        </>
      }
    >
      <View style={styles.heading}>
        <Text style={[styles.overline, { color: colors.primary }]}>
          {S.liveStatus(Math.max(shift.spotsOpen, 1))}
        </Text>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}
        >
          {shift.title}
        </Text>
      </View>

      <View style={styles.business}>
        <View style={[styles.businessTile, { backgroundColor: colors.fill }]}>
          <CoffeeIcon width={20} height={20} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.businessName, { color: colors.text }]}>
            {shift.businessName}
          </Text>
          <Text style={[styles.small, { color: colors.textSubtle }]}>
            {S.businessMeta(shift.isVerified, d.rating, d.reviews)}
          </Text>
        </View>
        {shift.isVerified ? (
          <BadgeCheckIcon width={20} height={20} color={colors.primary} />
        ) : null}
      </View>

      <StatTiles
        items={[
          { value: S.rate(rate), label: S.AGREED_RATE },
          {
            value: formatRupees(shift.hourlyRate * shift.durationHours),
            label: S.ESTIMATED,
          },
        ]}
      />

      <View style={styles.facts}>
        {facts.map(({ icon: Icon, text }) => (
          <View key={text} style={styles.fact}>
            <Icon width={15} height={15} color={colors.textSubtle} />
            <Text style={[styles.factText, { color: colors.textMuted }]}>
              {text}
            </Text>
          </View>
        ))}
      </View>

      <Text style={[styles.section, { color: colors.text }]}>
        {S.WHAT_YOU_DO}
      </Text>
      <Text style={[styles.body, { color: colors.textMuted }]}>
        {d.whatYouDo}
      </Text>

      <Text style={[styles.section, { color: colors.text }]}>
        {S.BEFORE_ACCEPT}
      </Text>
      <Text style={[styles.note, { color: colors.textMuted }]}>
        {d.beforeAccept}
      </Text>

      <InfoCallout text={d.firstComeNote} />

      <View style={styles.policy}>
        <Text style={[styles.policyTitle, { color: colors.text }]}>
          {S.CANCELLATION}
        </Text>
        <Text style={[styles.small, { color: colors.textSubtle }]}>
          {d.cancellation}
        </Text>
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  headerRight: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
  heading: { gap: 10 },
  overline: { fontFamily: FONTS.semiBold, fontSize: 10, lineHeight: 14 },
  title: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 28 },
  business: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  businessTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  businessName: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 19.6 },
  small: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
  facts: { gap: 8 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  factText: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
  section: { fontFamily: FONTS.regular, fontSize: 17, lineHeight: 23.8 },
  body: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 19.6 },
  note: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
  policy: { gap: 6, marginTop: 4 },
  policyTitle: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 16.8 },
});
