import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { StatTiles, StatusHero } from '@/components/shiftFlow';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { tabHome } from '@/route/tabRoutes';
import { FormScreen } from '@/layout/FormScreen';
import { meApi } from '@/services/api/meApi';
import { formatTime, isTaskShift } from '@/services/shifts/shiftMappers';
import { useAssignment } from '@/services/shifts/useShiftFlow';
import { useApiQuery } from '@/shared/hooks/useApiQuery';
import type { AppScreenProps } from '@/types';
import { formatRupees } from '@/utils/format';


/**
 * Live shift step 8. Figma: Live · Shift completed (light/dark).
 * - data: GET /assignments/{id} attendance
 */
export const ShiftCompletePage: FC<
  AppScreenProps<typeof ROUTES.shiftComplete>
> = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { shift } = route.params;
  const assignment = useAssignment(shift.assignmentId);
  const profile = useApiQuery(() => meApi.profile(), []);
  const attendance = assignment.data?.attendance;
  const minutes = attendance?.approved_minutes ?? attendance?.recorded_minutes ?? 0;
  const recordedHours = Math.round((minutes / 60) * 10) / 10;
  const firstName = profile.data?.worker?.full_name.trim().split(/\s+/)[0] ?? '';
  const checkOutTime = attendance?.checked_out_at ? formatTime(attendance.checked_out_at) : '';

  return (
    <FormScreen
      onBack={() => navigation.popToTop()}
      title={t('workerFlow.shiftSecured.headerTitle')}
      compactTitle
      headerTag={t('workerFlow.checkIn.headerRight')}
      gap={16}
      isLoading={assignment.isLoading}
      testID="shift-complete-page"
      actions={
        <>
          <PrimaryButton
            label={t('workerFlow.shiftComplete.viewEarnings')}
            onPress={() =>
              navigation.popTo(ROUTES.mainTabs, tabHome(ROUTES.workerEarnings))
            }
            testID="shift-complete-earnings"
          />
          <SecondaryButton
            label={t('workerFlow.shiftComplete.rateBusiness')}
            onPress={() => navigation.replace(ROUTES.rateBusiness, { shift })}
            testID="shift-complete-rate"
          />
        </>
      }
    >
      <StatusHero
        overline={t('workerFlow.shiftComplete.overline')}
        title={t('workerFlow.shiftComplete.heading')}
        subtitle={t('workerFlow.shiftComplete.subtitle', {
          name: firstName,
          time: checkOutTime,
        })}
      />
      <StatTiles
        items={[
          {
            value: t('workerFlow.shiftComplete.hours', {
              count: recordedHours,
            }),
            label: t('workerFlow.shiftComplete.recorded'),
          },
          {
            value: formatRupees(
              isTaskShift(shift)
                ? shift.estimatedPay ?? 0
                : Math.round(shift.hourlyRate * recordedHours),
            ),
            label: t('workerFlow.shiftComplete.earnings'),
          },
        ]}
      />
    </FormScreen>
  );
};
