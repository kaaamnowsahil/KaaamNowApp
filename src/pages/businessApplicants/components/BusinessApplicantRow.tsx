import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import type { BusinessApplicant } from '../mock';

export const BusinessApplicantRow: FC<{
    applicant: BusinessApplicant;
    isLast: boolean;
    onPress: () => void;
}> = ({ applicant, isLast, onPress }) => {
    const { t } = useTranslation();
    const { colors } = useTheme();

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={[
                styles.row,
                !isLast && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
            ]}
        >
            <View style={styles.copy}>
                <Text style={[styles.name, { color: colors.text }]}>{applicant.name}</Text>
                <Text style={[styles.meta, { color: colors.textSubtle }]}>
                    {t('businessApplicants.meta', {
                        experience: applicant.experience,
                        category: applicant.category,
                        rating: applicant.rating.toFixed(1),
                    })}
                </Text>
            </View>
            <Text
                style={[
                    styles.status,
                    {
                        color:
                            applicant.status === 'confirmed'
                                ? colors.success
                                : colors.warning,
                    },
                ]}
            >
                {t(`businessApplicants.status.${applicant.status}`)}
            </Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    row: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
    copy: { flex: 1, gap: 2 },
    name: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
    meta: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
    status: { fontFamily: FONTS.semiBold, fontSize: 10, lineHeight: 14 },
});