import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import {
  BrandAppBar,
  EmptyState,
  PrimaryButton,
  SectionHeading,
  ScreenIntro,
} from '@/components/ui';
import { TabScreen } from '@/layout/TabScreen';
import { BusinessShiftCard } from '@/pages/businessLive/components';
import {
  formatDateLabel,
  formatTimeRange,
} from '@/services/shifts/shiftMappers';

import { BusinessDraftCard, BusinessRosterCard } from './components';
import { useBusinessShifts } from './hooks';

export const BusinessShiftsPage: FC = () => {
  const { t } = useTranslation();
  const shifts = useBusinessShifts();
  const hasAnyShift =
    shifts.liveShifts.length +
      shifts.scheduledShifts.length +
      shifts.drafts.length >
    0;

  const blocks = [
    <ScreenIntro
      key="intro"
      title={t('businessShifts.title')}
      subtitle={
        shifts.businessName
          ? t(
              shifts.isVerified
                ? 'businessDashboard.verifiedSubtitle'
                : 'businessDashboard.unverifiedSubtitle',
              { business: shifts.businessName },
            )
          : undefined
      }
    />,
    ...(shifts.error
      ? [
          <EmptyState
            key="error"
            icon={CalendarDaysIcon}
            title={t('businessShifts.loadErrorTitle')}
            body={shifts.error}
            action={t('businessShifts.retry')}
            onAction={shifts.reload}
          />,
        ]
      : !hasAnyShift
      ? [
          <EmptyState
            key="empty"
            icon={CalendarDaysIcon}
            title={t('businessDashboard.emptyScheduledTitle')}
            body={t('businessDashboard.emptyScheduledBody')}
          />,
        ]
      : [
          ...(shifts.liveShifts.length
            ? [
                <SectionHeading
                  key="live-heading"
                  title={t('businessDashboard.todayLive')}
                />,
                ...shifts.liveShifts.map(({ item, card }) => (
                  <BusinessShiftCard
                    key={card.id}
                    shift={card}
                    view="live"
                    businessName={shifts.businessName}
                    isVerified={shifts.isVerified}
                    onPress={() => shifts.openShift(item)}
                  />
                )),
              ]
            : []),
          ...(shifts.drafts.length
            ? [
                <SectionHeading
                  key="draft-heading"
                  title={t('businessShiftCreate.savedDraft')}
                />,
                ...shifts.drafts.map(draft => (
                  <BusinessDraftCard
                    key={draft.id}
                    title={draft.job_title}
                    date={`${formatDateLabel(
                      draft.starts_at,
                    )} · ${formatTimeRange(draft.starts_at, draft.ends_at)}`}
                    onPress={() => shifts.openDraft(draft)}
                  />
                )),
              ]
            : []),
          ...(shifts.scheduledShifts.length
            ? [
                <SectionHeading
                  key="scheduled-heading"
                  title={t('businessShifts.scheduled')}
                />,
                <BusinessRosterCard
                  key="roster"
                  staffedCount={shifts.roster.staffedCount}
                  totalCount={shifts.roster.totalCount}
                  onPress={shifts.openRoster}
                />,
                <SectionHeading
                  key="upcoming-heading"
                  title={t('businessDashboard.upcoming')}
                />,
                ...shifts.scheduledShifts.map(({ item, card }) => (
                  <BusinessShiftCard
                    key={card.id}
                    shift={card}
                    view="scheduled"
                    businessName={shifts.businessName}
                    isVerified={shifts.isVerified}
                    onPress={() => shifts.openShift(item)}
                  />
                )),
              ]
            : []),
        ]),
  ];

  return (
    <TabScreen
      header={
        <BrandAppBar onBellPress={() => Alert.alert(t('common.comingSoon'))} />
      }
      blocks={blocks}
      gap={12}
      fillLastBlock={Boolean(shifts.error) || !hasAnyShift}
      isLoading={shifts.isLoading}
      testID="business-shifts-page"
      actions={
        <PrimaryButton
          label={t('businessDashboard.createShift')}
          onPress={shifts.openSchedule}
          testID="business-create-shift"
        />
      }
    />
  );
};
