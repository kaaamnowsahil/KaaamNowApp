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
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';

import {
  BOOKING_COPY,
  DETAILS_COPY,
  SHIFT_DETAILS_STRINGS as S,
} from './constants';
import { DEFAULT_SHIFT_INFO, SHIFT_INFO } from './mock';

/**
 * Step 2 of both worker flows. Figma: "Live · Café service associate" and
 * "Scheduled · Event service associate". With a bookingStatus (from My shifts)
 * the overline and primary action follow the booking instead.
 * - data: mock/shiftDetailsMock.ts
 */
export const ShiftDetailsPage: FC<
  AppScreenProps<typeof ROUTES.shiftDetails>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { shift, bookingStatus } = route.params;
  const isLoading = useMockLoading();
  const copy = DETAILS_COPY[shift.status];
  const booking = bookingStatus ? BOOKING_COPY[bookingStatus] : undefined;
  const info = { ...DEFAULT_SHIFT_INFO[shift.status], ...SHIFT_INFO[shift.id] };
  const rate = formatRupees(shift.hourlyRate);

  const primary = (() => {
    switch (bookingStatus) {
      case undefined:
        return {
          label: copy.accept(rate),
          onPress: () =>
            shift.status === 'live'
              ? navigation.replace(ROUTES.shiftSecured, { shift })
              : navigation.replace(ROUTES.applicationSubmitted, { shift }),
        };
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
      onBack={navigation.goBack}
      title={S.HEADER_TITLE}
      compactTitle
      headerTag={S.HEADER_TAG}
      gap={14}
      isLoading={isLoading}
      testID="shift-details-page"
      actions={
        <>
          {primary?.label ? (
            <PrimaryButton
              label={primary.label}
              disabled={primary.isDisabled}
              onPress={primary.onPress}
              testID="shift-details-primary"
            />
          ) : null}
          <SecondaryButton
            label={S.MESSAGE}
            onPress={() => Linking.openURL(`sms:${info.businessPhone}`)}
            testID="shift-details-message"
          />
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
        meta={S.businessMeta(shift.isVerified, info.rating, info.reviews)}
        isVerified={shift.isVerified}
      />

      <StatTiles
        items={[
          { value: S.rate(rate), label: S.AGREED_RATE },
          {
            value: formatRupees(shift.hourlyRate * shift.durationHours),
            label: S.ESTIMATED,
          },
        ]}
      />

      <FactList
        items={[
          { icon: CalendarIcon, text: S.when(shift.dateLabel, shift.timeLabel) },
          {
            icon: ClockIcon,
            text: `${t('shiftDetails.duration', { hours: shift.durationHours })} · ${info.durationNote}`,
          },
          {
            icon: MapPinIcon,
            text: `${info.placeLabel} · ${t('shiftDetails.distance', { distance: shift.distanceKm })}`,
          },
        ]}
      />

      <TextSection title={S.WHAT_YOU_DO} body={info.whatYouDo} />
      <TextSection title={S.BEFORE_ACCEPT} body={info.beforeAccept} variant="note" />
      <InfoCallout text={copy.callout} />
      <TextSection title={S.CANCELLATION} body={info.cancellation} variant="fine" />
    </FormScreen>
  );
};
