import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BadgeCheckIcon from '@/assets/figma/badge-check.svg';
import {
  BodyNote,
  PrimaryButton,
  SecondaryButton,
  SectionHeading,
} from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import { SHIFT_DETAILS_STRINGS as S } from './constants';
import { useShiftDetails } from './hooks/useShiftDetails';

/**
 * Opened from any shift card. No Figma frame; built from the Shift card (1:1502)
 * and Information row (1:206) styles.
 * - extra copy per shift: mock/shiftDetailsMock.ts
 */
export const ShiftDetailsPage: FC<
  AppScreenProps<typeof ROUTES.shiftDetails>
> = ({ navigation, route }) => {
  const { shift, bookingStatus } = route.params;
  const { colors } = useTheme();
  const d = useShiftDetails(shift);

  const facts = [
    {
      label: S.WHEN,
      value: `${shift.dateLabel} · ${shift.timeLabel} · ${shift.durationHours}h`,
    },
    { label: S.WHERE, value: `${d.address} · ${S.away(shift.distanceKm)}` },
    { label: S.REQUIREMENT, value: shift.requirement },
    { label: S.BREAK, value: d.extra.breakInfo },
    { label: S.MANAGER, value: d.extra.managerName },
  ];

  const isOffer = bookingStatus === 'selected' && !d.isOfferConfirmed;
  const actions = isOffer ? (
    <>
      <PrimaryButton
        label={S.CONFIRM_OFFER}
        onPress={d.confirmOffer}
        testID="shift-details-confirm"
      />
      <SecondaryButton
        label={S.DECLINE_OFFER}
        onPress={navigation.goBack}
        testID="shift-details-decline"
      />
    </>
  ) : bookingStatus ? undefined : (
    <PrimaryButton
      label={
        d.isRequested
          ? d.isLive
            ? S.ACCEPTED
            : S.APPLIED
          : d.isLive
            ? S.ACCEPT
            : S.APPLY
      }
      disabled={d.isRequested}
      onPress={d.request}
      testID="shift-details-cta"
    />
  );

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={S.TITLE}
      actions={actions}
      gap={16}
      isLoading={d.isLoading}
      testID="shift-details-page"
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.status,
            { color: d.isLive ? colors.success : colors.primary },
          ]}
        >
          {S.statusLine(
            d.isLive,
            bookingStatus ? undefined : shift.spotsOpen,
          )}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>
          {shift.title}
        </Text>
        <View style={styles.business}>
          {shift.isVerified ? (
            <BadgeCheckIcon width={15} height={15} color={colors.primary} />
          ) : null}
          <Text style={[styles.businessText, { color: colors.textMuted }]}>
            {shift.isVerified ? S.verified(shift.businessName) : shift.businessName}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.payCard,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.rate, { color: colors.text }]}>
          {formatRupees(shift.hourlyRate)}
          <Text style={[styles.perHour, { color: colors.textSubtle }]}>
            {S.PER_HOUR}
          </Text>
        </Text>
        <Text style={[styles.estimate, { color: colors.textSubtle }]}>
          {S.estimated(
            formatRupees(shift.hourlyRate * shift.durationHours),
            shift.durationHours,
          )}
        </Text>
      </View>

      <View>
        {facts.map(fact => (
          <View
            key={fact.label}
            style={[styles.fact, { borderBottomColor: colors.border }]}
          >
            <Text style={[styles.factLabel, { color: colors.textSubtle }]}>
              {fact.label}
            </Text>
            <Text style={[styles.factValue, { color: colors.text }]}>
              {fact.value}
            </Text>
          </View>
        ))}
      </View>

      <SectionHeading title={S.ABOUT} />
      <BodyNote>{d.extra.about}</BodyNote>

      <SectionHeading title={S.BRING} />
      <View style={styles.bring}>
        {d.extra.bring.map(item => (
          <View key={item} style={styles.bringRow}>
            <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
            <Text style={[styles.bringText, { color: colors.text }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      {d.isOfferConfirmed ? (
        <BodyNote>{S.OFFER_CONFIRMED}</BodyNote>
      ) : bookingStatus ? (
        <BodyNote>{S.BOOKING_NOTE[bookingStatus]}</BodyNote>
      ) : d.isRequested ? (
        <BodyNote>{d.isLive ? S.ACCEPTED_NOTE : S.APPLIED_NOTE}</BodyNote>
      ) : null}
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  header: { gap: 4 },
  status: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 16.8 },
  title: { fontFamily: FONTS.bold, fontSize: 25, lineHeight: 29.5 },
  business: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  businessText: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 19.6 },
  payCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 2 },
  rate: { fontFamily: FONTS.bold, fontSize: 26, lineHeight: 34 },
  perHour: { fontFamily: FONTS.bold, fontSize: 14 },
  estimate: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
  fact: { paddingVertical: 12, gap: 2, borderBottomWidth: 1 },
  factLabel: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  factValue: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 22.5 },
  bring: { gap: 8 },
  bringRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bullet: { width: 6, height: 6, borderRadius: 3 },
  bringText: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 19.6 },
});
