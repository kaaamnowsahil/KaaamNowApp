import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import CalendarDaysIcon from '@/assets/figma/calendar-days.svg';
import ZapIcon from '@/assets/figma/zap.svg';
import {
  BrandAppBar,
  EmptyState,
  PrimaryButton,
  SectionHeading,
  SegmentedControl,
} from '@/components/ui';
import { TabScreen } from '@/layout/TabScreen';
import {
  BusinessOwnedShiftCard,
  BusinessShiftCancelSheet,
} from '@/pages/businessShifts/components';
import { useTheme } from '@/theme/ThemeProvider';

import {
  BusinessLocation,
  BusinessMetrics,
  BusinessOverview,
} from './components';
import { useBusinessLive } from './hooks';

export const BusinessLivePage: FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const dashboard = useBusinessLive();
  const isLive = dashboard.view === 'live';

  const blocks = [
    <BusinessOverview
      key="overview"
      businessName={dashboard.businessName}
      isVerified={dashboard.isVerified}
    />,
    <BusinessLocation key="location" />,
    <SegmentedControl
      key="view-toggle"
      segments={[
        { id: 'live' as const, label: t('businessDashboard.liveNow') },
        { id: 'scheduled' as const, label: t('businessDashboard.scheduled') },
      ]}
      value={dashboard.view}
      onChange={dashboard.setView}
    />,
    ...(dashboard.error
      ? []
      : [
          <BusinessMetrics
            key="metrics"
            confirmedWorkers={dashboard.confirmedWorkers}
            workersRequired={dashboard.workersRequired}
            newApplicants={dashboard.newApplicants}
          />,
        ]),
    ...(dashboard.error
      ? [
          <EmptyState
            key="error"
            icon={CalendarDaysIcon}
            title={t('businessShifts.loadErrorTitle')}
            body={dashboard.error}
            action={t('businessShifts.retry')}
            onAction={dashboard.reload}
          />,
        ]
      : dashboard.shifts.length > 0
      ? [
          <SectionHeading
            key="section"
            title={t('businessDashboard.upcoming')}
            statusColor={colors.primary}
            action={t('businessDashboard.viewAll')}
            onAction={dashboard.openShifts}
          />,
          ...dashboard.shifts.map(shift => (
            <BusinessOwnedShiftCard
              key={shift.id}
              shift={shift}
              titleColor={colors.primary}
              isPaying={dashboard.payingId === shift.id}
              isPublishing={dashboard.publishingId === shift.id}
              error={
                dashboard.cardError?.shiftId === shift.id
                  ? dashboard.cardError.message
                  : ''
              }
              onCancel={() => dashboard.openCancel(shift)}
              onPay={() => dashboard.payDeposit(shift)}
              onPublish={() => dashboard.publish(shift)}
              onOpenBooked={() => dashboard.openBooked(shift)}
              onOpenWithdrawn={dashboard.openApplicants}
              onOpenLive={() => dashboard.openLive(shift)}
            />
          )),
        ]
      : [
          <EmptyState
            key="empty"
            icon={isLive ? ZapIcon : CalendarDaysIcon}
            title={t(
              isLive
                ? 'businessDashboard.emptyLiveTitle'
                : 'businessDashboard.emptyScheduledTitle',
            )}
            body={t(
              isLive
                ? 'businessDashboard.emptyLiveBody'
                : 'businessDashboard.emptyScheduledBody',
            )}
          />,
        ]),
  ];

  return (
    <>
      <TabScreen
        header={<BrandAppBar onBellPress={dashboard.openNotifications} />}
        blocks={blocks}
        gap={12}
        fillLastBlock={
          Boolean(dashboard.error) || dashboard.shifts.length === 0
        }
        isLoading={dashboard.isLoading}
        busy={dashboard.isRefreshing}
        testID="business-live-page"
        actions={
          <PrimaryButton
            label={t(
              isLive
                ? 'businessDashboard.postLiveRequest'
                : 'businessDashboard.createShift',
            )}
            onPress={dashboard.openSchedule}
            testID="business-create-shift"
          />
        }
      />
      {dashboard.cancelTarget ? (
        <BusinessShiftCancelSheet
          cutoffHours={dashboard.cancelTarget.cancellation_cutoff_hours}
          preview={dashboard.cancelPreview}
          error={dashboard.cancelError}
          isCancelling={dashboard.isCancelling}
          onClose={dashboard.closeCancel}
          onConfirm={dashboard.confirmCancel}
        />
      ) : null}
    </>
  );
};
