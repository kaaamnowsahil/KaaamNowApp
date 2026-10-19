import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoCard, StatTiles } from '@/components/liveShift';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useCountdown } from '@/shared/hooks/useCountdown';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';
import { formatMinSec, formatRupees } from '@/utils/format';

import { PushPreview } from './components';
import { LIVE_REQUEST_STRINGS as S } from './constants';
import { LIVE_REQUEST } from './mock';

/**
 * Live shift step 1. Figma: NEW · Live · New request nearby (light/dark).
 * Accept secures the shift; the shift card opens full details.
 * - data: mock/liveRequestMock.ts
 */
export const LiveRequestPage: FC<AppScreenProps<typeof ROUTES.liveRequest>> = ({
  navigation,
  route,
}) => {
  const { shift } = route.params;
  const { colors } = useTheme();
  const isLoading = useMockLoading();
  const { remaining } = useCountdown(LIVE_REQUEST.expiresInSeconds);
  const isExpired = remaining === 0;
  const timeLeft = formatMinSec(remaining);

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={S.HEADER_TITLE}
      subtitle={S.HEADER_SUBTITLE}
      gap={14}
      isLoading={isLoading}
      testID="live-request-page"
      actions={
        <>
          <PrimaryButton
            label={isExpired ? S.EXPIRED : S.ACCEPT}
            disabled={isExpired}
            onPress={() => navigation.replace(ROUTES.shiftSecured, { shift })}
            testID="live-request-accept"
          />
          <SecondaryButton
            label={S.DECLINE}
            onPress={navigation.goBack}
            testID="live-request-decline"
          />
        </>
      }
    >
      <PushPreview
        initial={LIVE_REQUEST.senderInitial}
        meta={S.pushMeta(LIVE_REQUEST.sender, LIVE_REQUEST.sentAt)}
        title={S.pushTitle(shift.distanceKm)}
        body={S.pushBody(shift.title, LIVE_REQUEST.startsLabel)}
      />

      <View style={styles.heading}>
        <Text style={[styles.overline, { color: colors.primary }]}>
          {S.OVERLINE}
        </Text>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: colors.text }]}
        >
          {S.HEADING}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
          {S.acceptWithin(timeLeft)}
        </Text>
      </View>

      <StatTiles
        items={[
          { value: S.km(shift.distanceKm), label: S.FROM_LOCATION },
          { value: timeLeft, label: S.TIME_TO_ACCEPT },
        ]}
      />

      <InfoCard
        title={shift.title}
        caption={S.shiftCaption(shift.businessName, shift.durationHours)}
        badge={LIVE_REQUEST.startsBadge}
        onPress={() => navigation.navigate(ROUTES.liveDetails, { shift })}
        testID="live-request-shift"
      />
      <InfoCard
        title={S.PAY}
        caption={S.payCaption(
          formatRupees(shift.hourlyRate),
          LIVE_REQUEST.payNote,
        )}
      />
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  heading: { gap: 6, marginTop: 6 },
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 11,
    lineHeight: 15.4,
    letterSpacing: 0.3,
  },
  title: { fontFamily: FONTS.bold, fontSize: 23, lineHeight: 29 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
});
