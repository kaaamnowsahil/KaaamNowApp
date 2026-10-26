import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import BadgeAlertIcon from '@/assets/figma/badge-alert.svg';
import BadgeCheckIcon from '@/assets/figma/badge-check.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type BusinessOverviewProps = {
    businessName: string;
    isVerified: boolean;
};

/** Business name in green (verified) or amber (not yet verified) with the matching badge. */
export const BusinessIdentity: FC<BusinessOverviewProps> = ({ businessName, isVerified }) => {
    const { colors } = useTheme();
    const identityColor = isVerified ? colors.success : colors.warning;

    return (
        <View style={styles.identity}>
            <Text style={[styles.identityName, { color: identityColor }]}>
                {businessName}
            </Text>
            {isVerified ? (
                <BadgeCheckIcon width={18} height={18} color={identityColor} />
            ) : (
                <BadgeAlertIcon width={18} height={18} color={identityColor} />
            )}
        </View>
    );
};

export const BusinessOverview: FC<BusinessOverviewProps> = ({
    businessName,
    isVerified,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();

    return (
        <View style={styles.root}>
            <Text accessibilityRole="header" style={[styles.heading, { color: colors.text }]}>
                {t('businessDashboard.heading')}
            </Text>
            <BusinessIdentity businessName={businessName} isVerified={isVerified} />
        </View>
    );
};

type BusinessMetricsProps = {
    confirmedWorkers: number;
    workersRequired: number;
    newApplicants: number;
};

export const BusinessMetrics: FC<BusinessMetricsProps> = ({
    confirmedWorkers,
    workersRequired,
    newApplicants,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const metrics = [
        {
            value: `${confirmedWorkers}/${workersRequired}`,
            label: t('businessDashboard.confirmedWorkers'),
        },
        { value: String(newApplicants), label: t('businessDashboard.newApplicants') },
    ];

    return (
        <View style={styles.metrics}>
            {metrics.map(metric => (
                <View
                    key={metric.label}
                    style={[styles.metric, { backgroundColor: colors.fill }]}
                >
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                        {metric.value}
                    </Text>
                    <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
                        {metric.label}
                    </Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    root: { gap: 4 },
    heading: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 28 },
    identity: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    identityName: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
    metrics: { flexDirection: 'row', gap: 10 },
    metric: {
        flex: 1,
        minHeight: 96,
        borderRadius: 22,
        padding: 18,
        justifyContent: 'center',
        gap: 8,
    },
    metricValue: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 28 },
    metricLabel: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 20 },
});
