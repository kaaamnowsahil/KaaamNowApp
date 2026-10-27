import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import {
  BrandAppBar,
  EmptyState,
  ScreenIntro,
  SectionHeading,
} from '@/components/ui';
import { TabScreen } from '@/layout/TabScreen';
import { useTheme } from '@/theme/ThemeProvider';

import { MyShiftCard } from './components';
import { WORKER_SHIFTS_STRINGS } from './constants';
import { useWorkerShifts } from './hooks/useWorkerShifts';

/**
 * Worker "My shifts" tab. Figma: 08 · WORKER — Main tabs, My shifts (light/dark).
 * - state + sections: hooks/useWorkerShifts.ts
 * - data: GET /worker/my-shifts
 */
export const WorkerShiftsPage: FC = () => {
  const { t } = useTranslation();
  const shifts = useWorkerShifts();
  const { colors } = useTheme();

  const blocks = [
    <ScreenIntro
      key="intro"
      title={t('workerShifts.title')}
      subtitle={t('workerShifts.subtitle')}
    />,
    ...(shifts.sections.length
      ? shifts.sections.flatMap(section => [
          <SectionHeading
            key={`heading-${section.id}`}
            title={t(`workerShifts.sections.${section.id}`)}
            statusColor={section.id === 'live' ? colors.danger : undefined}
            isLive={section.id === 'live'}
          />,
          ...section.bookings.map(booking => (
            <MyShiftCard
              key={booking.id}
              booking={booking}
              onPress={() => shifts.openBooking(booking)}
              busy={shifts.pending !== null}
              pendingAction={
                shifts.pending?.id === booking.id
                  ? shifts.pending.action
                  : undefined
              }
              onSelection={action => shifts.respondToSelection(booking, action)}
            />
          )),
        ])
      : [
          shifts.error ? (
            <EmptyState
              key="error"
              icon={CalendarDaysIcon}
              title={WORKER_SHIFTS_STRINGS.LOAD_ERROR_TITLE}
              body={shifts.error}
              action={WORKER_SHIFTS_STRINGS.RETRY}
              onAction={shifts.retry}
            />
          ) : (
            <EmptyState
              key="empty"
              icon={CalendarDaysIcon}
              title={t('workerShifts.emptyTitle')}
              body={t('workerShifts.emptyBody')}
              action={t('workerShifts.emptyAction')}
              onAction={shifts.findShifts}
            />
          ),
        ]),
  ];

  return (
    <TabScreen
      header={<BrandAppBar onBellPress={shifts.openNotifications} />}
      blocks={blocks}
      gap={12}
      fillLastBlock={Boolean(shifts.error) || shifts.sections.length === 0}
      isLoading={shifts.isLoading}
      testID="worker-shifts-page"
    />
  );
};
