import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { shift } = route.params;
  const isLive = shift.status === 'live';
  const copyKey = isLive ? 'live' : 'scheduled';
  const copy = (key: string, options?: Record<string, string | number>) =>
    t(`workerFlow.request.${copyKey}.${key}`, options);
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
      title={t('workerFlow.shiftSecured.headerTitle')}
      subtitle={copy('headerSubtitle')}
      gap={14}
      isLoading={isLoading}
      testID="shift-request-page"
      actions={
        <>
          <PrimaryButton
            label={isExpired ? copy('expired') : copy('accept')}
            disabled={isExpired}
            onPress={accept}
            testID="shift-request-accept"
          />
          <SecondaryButton
            label={copy('decline')}
            onPress={navigation.goBack}
            testID="shift-request-decline"
          />
        </>
      }
    >
      <PushPreview
        initial={meta.senderInitial}
        meta={t('workerFlow.request.pushMeta', {
          sender: meta.sender,
          time: meta.sentAt,
        })}
        title={copy('pushTitle', { distance: shift.distanceKm })}
        body={t('workerFlow.request.pushBody', {
          role: shift.title,
          when: isLive ? meta.badge : shift.dateLabel,
        })}
      />

      <FlowHeading
        isLarge
        overline={copy('overline')}
        title={copy('heading')}
        subtitle={
          isLive
            ? copy('acceptWithin', { time: timeLeft })
            : copy('subtitle')
        }
      />

      <StatTiles
        items={[
          {
            value: t('workerFlow.request.km', { distance: shift.distanceKm }),
            label: t('workerFlow.request.fromLocation'),
          },
          isLive
            ? { value: timeLeft, label: copy('timeToAccept') }
            : {
              value: copy(shift.durationHours === 1 ? 'hour' : 'hours', {
                hours: shift.durationHours,
              }),
              label: copy('shiftLength'),
            },
        ]}
      />

      <InfoCard
        title={shift.title}
        caption={
          isLive
            ? copy('shiftCaption', {
              business: shift.businessName,
              hours: shift.durationHours,
            })
            : copy('shiftCaption', {
              date: shift.dateLabel,
              time: shift.timeLabel,
            })
        }
        badge={meta.badge}
        onPress={() => navigation.navigate(ROUTES.shiftDetails, { shift })}
        testID="shift-request-shift"
      />
      <InfoCard
        title={t('workerFlow.request.pay')}
        caption={t('workerFlow.request.payCaption', {
          rate: formatRupees(shift.hourlyRate),
          note: meta.payNote,
        })}
      />
    </FormScreen>
  );
};
