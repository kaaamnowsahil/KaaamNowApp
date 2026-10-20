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

import { MyShiftCard } from './components';
import { useWorkerShifts } from './hooks/useWorkerShifts';

/**
 * Worker "My shifts" tab. Figma: 08 · WORKER — Main tabs, My shifts (light/dark).
 * - state + sections: hooks/useWorkerShifts.ts
 * - data: mock/workerShiftsMock.ts
 */
export const WorkerShiftsPage: FC = () => {
  const { t } = useTranslation();
  const shifts = useWorkerShifts();

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
        />,
        ...section.bookings.map(booking => (
          <MyShiftCard
            key={booking.id}
            booking={booking}
            onPress={() => shifts.openBooking(booking)}
            onAction={() => shifts.runAction(booking)}
          />
        )),
      ])
      : [
        <EmptyState
          key="empty"
          icon={CalendarDaysIcon}
          title={t('workerShifts.emptyTitle')}
          body={t('workerShifts.emptyBody')}
          action={t('workerShifts.emptyAction')}
          onAction={shifts.findShifts}
        />,
      ]),
  ];

  return (
    <TabScreen
      header={
        <BrandAppBar
          onBellPress={shifts.openNotifications}
          hasUnread={shifts.hasUnread}
        />
      }
      blocks={blocks}
      gap={12}
      isLoading={shifts.isLoading}
      testID="worker-shifts-page"
    />
  );
};
