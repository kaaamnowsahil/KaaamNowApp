import { useEffect, type FC } from 'react';
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
import { getDevicePosition } from '@/services/maps/devicePosition';
import { shiftsApi } from '@/services/shifts/shiftsApi';
import { useShiftAction } from '@/services/shifts/useShiftFlow';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import { useCountdown } from '@/shared/hooks/useCountdown';
import type { AppScreenProps } from '@/types';
import { formatMinSec, formatRupees } from '@/utils/format';

import { SHIFT_REQUEST_STRINGS } from './constants/shiftRequestStrings';

/**
 * Step 1 of both worker flows, chosen by shift.status.
 * Figma: "Live · New request nearby" and "Scheduled · New shift near you".
 * - live: POST /worker/live-shifts/{id}/accept → Shift secured
 * - scheduled: POST /worker/shifts/{id}/applications → Application submitted
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
  const action = useShiftAction();

  const dispatch = useApiQuery(
    async () =>
      isLive
        ? ((await shiftsApi.liveRequests()).find(item => item.shift.id === shift.id) ?? null)
        : null,
    [shift.id, isLive],
  );
  const { remaining, restart } = useCountdown(dispatch.data?.seconds_left ?? 0);
  useEffect(() => {
    if (dispatch.data) restart();
  }, [dispatch.data, restart]);
  const hasCountdown = Boolean(dispatch.data);
  const isExpired = hasCountdown && remaining === 0;
  const timeLeft = formatMinSec(remaining);
  const badge = SHIFT_REQUEST_STRINGS.BADGE[shift.status];

  const accept = () =>
    isLive
      ? action.run(
        () => shiftsApi.acceptLive(shift.id),
        assignment =>
          navigation.replace(ROUTES.shiftSecured, {
            shift: { ...shift, assignmentId: assignment.id, assignmentStatus: assignment.status },
          }),
        SHIFT_REQUEST_STRINGS.ACCEPT_FAILED,
      )
      : action.run(
        async () => shiftsApi.apply(shift.id, (await getDevicePosition(5000)) ?? undefined),
        application =>
          navigation.replace(ROUTES.applicationSubmitted, {
            shift: {
              ...shift,
              applicationId: application.id,
              applicationStatus: application.status,
            },
          }),
        SHIFT_REQUEST_STRINGS.APPLY_FAILED,
      );

  const decline = () =>
    isLive
      ? action.run(
        () => shiftsApi.declineLive(shift.id),
        () => navigation.goBack(),
        SHIFT_REQUEST_STRINGS.DECLINE_FAILED,
      )
      : navigation.goBack();

  return (
    <FormScreen
      busy={action.busy}
      onBack={navigation.goBack}
      title={t('workerFlow.shiftSecured.headerTitle')}
      subtitle={copy('headerSubtitle')}
      gap={14}
      isLoading={dispatch.isLoading}
      testID="shift-request-page"
      actions={
        <>
          <PrimaryButton
            label={isExpired ? copy('expired') : copy('accept')}
            disabled={isExpired || action.busy}
            onPress={accept}
            testID="shift-request-accept"
          />
          <SecondaryButton
            label={copy('decline')}
            disabled={action.busy}
            onPress={decline}
            testID="shift-request-decline"
          />
        </>
      }
    >
      <PushPreview
        initial={SHIFT_REQUEST_STRINGS.SENDER_INITIAL}
        meta={t('workerFlow.request.pushMeta', {
          sender: SHIFT_REQUEST_STRINGS.SENDER,
          time: SHIFT_REQUEST_STRINGS.SENT_AT,
        })}
        title={copy('pushTitle', { distance: shift.distanceKm })}
        body={t('workerFlow.request.pushBody', {
          role: shift.title,
          when: isLive ? badge : shift.dateLabel,
        })}
      />

      <FlowHeading
        isLarge
        overline={copy('overline')}
        title={copy('heading')}
        subtitle={
          isLive && hasCountdown
            ? copy('acceptWithin', { time: timeLeft })
            : isLive
              ? undefined
              : copy('subtitle')
        }
      />

      <StatTiles
        items={[
          {
            value: t('workerFlow.request.km', { distance: shift.distanceKm }),
            label: t('workerFlow.request.fromLocation'),
          },
          isLive && hasCountdown
            ? { value: timeLeft, label: copy('timeToAccept') }
            : {
              value: t(
                `workerFlow.request.scheduled.${shift.durationHours === 1 ? 'hour' : 'hours'}`,
                { hours: shift.durationHours },
              ),
              label: t('workerFlow.request.scheduled.shiftLength'),
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
        badge={badge}
        onPress={() => navigation.navigate(ROUTES.shiftDetails, { shift })}
        testID="shift-request-shift"
      />
      <InfoCard
        title={t('workerFlow.request.pay')}
        caption={t('workerFlow.request.payCaption', {
          rate: formatRupees(shift.hourlyRate),
          note: SHIFT_REQUEST_STRINGS.PAY_NOTE,
        })}
      />
    </FormScreen>
  );
};
