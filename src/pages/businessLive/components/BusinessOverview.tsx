import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type BusinessOverviewProps = {
    businessName: string;
    isVerified: boolean;
    liveConfirmed: number;
    liveTotal: number;
    newApplicants: number;
};

export const BusinessOverview: FC<BusinessOverviewProps> = ({
    businessName,
    isVerified,
    liveConfirmed,
    liveTotal,
    newApplicants,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();

    return (
        <View style={styles.root}>
            <Text accessibilityRole="header" style={[styles.heading, { color: colors.text }]}>
                {t('businessDashboard.heading')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
                {t(
                    isVerified
                        ? 'businessDashboard.verifiedSubtitle'
                        : 'businessDashboard.unverifiedSubtitle',
                    { business: businessName },
                )}
            </Text>
            <View style={styles.metrics}>
                <View style={[styles.metric, { backgroundColor: colors.fill }]}>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                        {liveConfirmed} / {liveTotal}
                    </Text>
                    <Text style={[styles.metricLabel, { color: colors.textSubtle }]}>
                        {t('businessDashboard.liveConfirmed')}
                    </Text>
                </View>
                <View style={[styles.metric, { backgroundColor: colors.fill }]}>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                        {newApplicants}
                    </Text>
                    <Text style={[styles.metricLabel, { color: colors.textSubtle }]}>
                        {t('businessDashboard.newApplicants')}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    root: { gap: 4 },
    heading: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 28 },
    subtitle: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
    metrics: { flexDirection: 'row', gap: 10, marginTop: 8 },
    metric: {
        flex: 1,
        minHeight: 60,
        borderRadius: 12,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
    },
    metricValue: { fontFamily: FONTS.bold, fontSize: 19, lineHeight: 25 },
    metricLabel: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
});