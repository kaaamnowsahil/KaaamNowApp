import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BadgeCheckIcon from '@/assets/figma/badge-check.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { formatRupees } from '@/utils/format';

import type { BusinessDashboardShift } from '../mock';
import type { BusinessView } from '../hooks/useBusinessLive';

type BusinessShiftCardProps = {
    shift: BusinessDashboardShift;
    view: BusinessView;
    businessName: string;
    isVerified: boolean;
    onPress: () => void;
};

export const BusinessShiftCard: FC<BusinessShiftCardProps> = ({
    shift,
    view,
    businessName,
    isVerified,
    onPress,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const isLive = view === 'live';

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.pressed,
            ]}
        >
            <View style={styles.row}>
                <Text style={[styles.status, { color: isLive ? colors.success : colors.primary }]}>
                    {t(isLive ? 'businessDashboard.liveStatus' : 'businessDashboard.scheduledStatus')}
                </Text>
                <Text style={[styles.meta, { color: colors.textSubtle }]}>
                    {t('businessDashboard.distance', { distance: shift.distanceKm })}
                </Text>
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{shift.title}</Text>
            <View style={styles.business}>
                {isVerified ? <BadgeCheckIcon width={14} height={14} color={colors.primary} /> : null}
                <Text style={[styles.meta, { color: colors.textSubtle }]}>
                    {businessName}{isVerified ? ` · ${t('businessDashboard.verified')}` : ''}
                </Text>
            </View>
            <Text style={[styles.meta, { color: colors.textSubtle }]}>
                {t('businessDashboard.dateTimeHours', {
                    date: shift.date,
                    time: shift.time,
                    hours: shift.hours,
                })}
            </Text>
            <Text style={[styles.meta, { color: colors.textSubtle }]}>
                {t('businessDashboard.areaRequirement', {
                    area: shift.area,
                    requirement: shift.requirement,
                })}
            </Text>
            <View style={[styles.row, styles.payRow]}>
                <View>
                    <Text style={[styles.rate, { color: colors.text }]}>
                        {formatRupees(shift.hourlyRate)}
                        <Text style={[styles.perHour, { color: colors.textSubtle }]}>
                            {t('businessDashboard.perHour')}
                        </Text>
                    </Text>
                    <Text style={[styles.meta, { color: colors.textSubtle }]}>
                        {t('businessDashboard.estimated', {
                            amount: formatRupees(shift.estimatedTotal),
                        })}
                    </Text>
                </View>
                <Text style={[styles.status, { color: colors.primary }]}>
                    {isLive
                        ? t('businessDashboard.confirmed', {
                            count: shift.confirmedCount,
                            total: shift.totalSpots,
                        })
                        : t('businessDashboard.applicants', { count: shift.applicantCount })}
                </Text>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: { borderWidth: 1, borderRadius: 14, padding: 12, gap: 5 },
    pressed: { opacity: 0.88 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    status: { fontFamily: FONTS.semiBold, fontSize: 10, lineHeight: 15 },
    title: { fontFamily: FONTS.regular, fontSize: 16, lineHeight: 22 },
    business: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    meta: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
    payRow: { alignItems: 'flex-end', marginTop: 2 },
    rate: { fontFamily: FONTS.bold, fontSize: 17, lineHeight: 22 },
    perHour: { fontFamily: FONTS.regular, fontSize: 11 },
});