import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { BrandAppBar, PrimaryButton, SectionHeading, ScreenIntro } from '@/components/ui';
import { TabScreen } from '@/layout/TabScreen';

import { BusinessShiftCard } from '@/pages/businessLive/components';

import { BusinessRosterCard } from './components';
import { useBusinessShifts } from './hooks';

export const BusinessShiftsPage: FC = () => {
    const { t } = useTranslation();
    const shifts = useBusinessShifts();

    const showCreateNotice = () =>
        Alert.alert(t('businessDashboard.createShift'), t('common.comingSoon'));

    const blocks = [
        <ScreenIntro
            key="intro"
            title={t('businessShifts.title')}
            subtitle={t('businessDashboard.verifiedSubtitle', {
                business: shifts.businessName,
            })}
        />,
        <SectionHeading key="live-heading" title={t('businessDashboard.todayLive')} />,
        ...shifts.liveShifts.map(shift => (
            <BusinessShiftCard
                key={shift.id}
                shift={shift}
                view="live"
                businessName={shifts.businessName}
                isVerified={shifts.isVerified}
                onPress={shifts.openApplicants}
            />
        )),
        <SectionHeading key="scheduled-heading" title={t('businessShifts.scheduled')} />,
        <BusinessRosterCard
            key="roster"
            staffedCount={shifts.roster.staffedCount}
            totalCount={shifts.roster.totalCount}
            onPress={shifts.openApplicants}
        />,
        <SectionHeading key="upcoming-heading" title={t('businessDashboard.upcoming')} />,
        ...shifts.scheduledShifts.map(shift => (
            <BusinessShiftCard
                key={shift.id}
                shift={shift}
                view="scheduled"
                businessName={shifts.businessName}
                isVerified={shifts.isVerified}
                onPress={shifts.openApplicants}
            />
        )),
    ];

    return (
        <TabScreen
            header={<BrandAppBar onBellPress={() => Alert.alert(t('common.comingSoon'))} />}
            blocks={blocks}
            gap={12}
            isLoading={shifts.isLoading}
            testID="business-shifts-page"
            actions={
                <PrimaryButton
                    label={t('businessDashboard.createShift')}
                    onPress={showCreateNotice}
                    testID="business-create-shift"
                />
            }
        />
    );
};