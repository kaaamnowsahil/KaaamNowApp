import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ChevronRightIcon from '@/assets/figma/chevron-right.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type BusinessRosterCardProps = {
    staffedCount: number;
    totalCount: number;
    onPress: () => void;
};

export const BusinessRosterCard: FC<BusinessRosterCardProps> = ({
    staffedCount,
    totalCount,
    onPress,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();

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
            <View style={styles.copy}>
                <Text style={[styles.status, { color: colors.success }]}>
                    {t('businessShifts.fullyStaffed', {
                        count: staffedCount,
                        total: totalCount,
                    })}
                </Text>
                <Text style={[styles.title, { color: colors.text }]}>
                    {t('businessShifts.rosterTitle')}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
                    {t('businessShifts.viewSelectedOffers')}
                </Text>
            </View>
            <ChevronRightIcon width={18} height={18} color={colors.textSubtle} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        minHeight: 82,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    pressed: { opacity: 0.88 },
    copy: { flex: 1, gap: 4 },
    status: { fontFamily: FONTS.semiBold, fontSize: 10, lineHeight: 15 },
    title: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 20 },
    subtitle: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
});