import type { FC } from 'react';

import {
  FlowHeading,
  InfoCard,
  PushPreview,
  StatTiles,
} from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useCountdown } from '@/shared/hooks/useCountdown';
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { AppScreenProps } from '@/types';
import { formatMinSec, formatRupees } from '@/utils/format';

import {
  LIVE_REQUEST_STRINGS as L,
  REQUEST_COPY,
  SCHEDULED_REQUEST_STRINGS as SC,
  SHIFT_REQUEST_STRINGS as S,
} from './constants';
import { REQUEST_META } from './mock';

/**
 * Step 1 of both worker flows, chosen by shift.status.
 * Figma: "Live · New request nearby" and "Scheduled · New shift near you".
 * - live: accept within the countdown → Shift secured
 * - scheduled: apply → Application submitted
 * - data: mock/shiftRequestMock.ts
 */
export const ShiftRequestPage: FC<
  AppScreenProps<typeof ROUTES.shiftRequest>
> = ({ navigation, route }) => {
  const { shift } = route.params;
  const isLive = shift.status === 'live';
  const copy = REQUEST_COPY[shift.status];
  const meta = REQUEST_META[shift.status];
  const isLoading = useMockLoading();
  const { remaining } = useCountdown(meta.expiresInSeconds);
  const isExpired = isLive && remaining === 0;
  const timeLeft = formatMinSec(remaining);

  const accept = () =>
    isLive
      ? navigation.replace(ROUTES.shiftSecured, { shift })
      : navigation.replace(ROUTES.applicationSubmitted, { shift });

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={S.HEADER_TITLE}
      subtitle={copy.headerSubtitle}
      gap={14}
      isLoading={isLoading}
      testID="shift-request-page"
      actions={
        <>
          <PrimaryButton
            label={isExpired ? L.EXPIRED : copy.accept}
            disabled={isExpired}
            onPress={accept}
            testID="shift-request-accept"
          />
          <SecondaryButton
            label={copy.decline}
            onPress={navigation.goBack}
            testID="shift-request-decline"
          />
        </>
      }
    >
      <PushPreview
        initial={meta.senderInitial}
        meta={S.pushMeta(meta.sender, meta.sentAt)}
        title={copy.pushTitle(shift.distanceKm)}
        body={S.pushBody(
          shift.title,
          isLive ? meta.badge : shift.dateLabel,
        )}
      />

      <FlowHeading
        isLarge
        overline={copy.overline}
        title={copy.heading}
        subtitle={isLive ? L.acceptWithin(timeLeft) : SC.SUBTITLE}
      />

      <StatTiles
        items={[
          { value: S.km(shift.distanceKm), label: S.FROM_LOCATION },
          isLive
            ? { value: timeLeft, label: L.TIME_TO_ACCEPT }
            : { value: SC.hours(shift.durationHours), label: SC.SHIFT_LENGTH },
        ]}
      />

      <InfoCard
        title={shift.title}
        caption={
          isLive
            ? L.shiftCaption(shift.businessName, shift.durationHours)
            : SC.shiftCaption(shift.dateLabel, shift.timeLabel)
        }
        badge={meta.badge}
        onPress={() => navigation.navigate(ROUTES.shiftDetails, { shift })}
        testID="shift-request-shift"
      />
      <InfoCard
        title={S.PAY}
        caption={S.payCaption(formatRupees(shift.hourlyRate), meta.payNote)}
      />
    </FormScreen>
  );
};
