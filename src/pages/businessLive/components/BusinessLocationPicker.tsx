import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ChevronDownIcon from '@/assets/figma/chevron-down.svg';
import MapPinIcon from '@/assets/figma/map-pin-home.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type BusinessLocationPickerProps = {
    location: string;
    options: string[];
    isOpen: boolean;
    onToggle: () => void;
    onSelect: (location: string) => void;
};

export const BusinessLocationPicker: FC<BusinessLocationPickerProps> = ({
    location,
    options,
    isOpen,
    onToggle,
    onSelect,
}) => {
    const { t } = useTranslation();
    const { colors } = useTheme();

    return (
        <View style={styles.root}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('businessDashboard.changeLocation', { location })}
                accessibilityState={{ expanded: isOpen }}
                onPress={onToggle}
                style={styles.button}
            >
                <MapPinIcon width={16} height={16} color={colors.primary} />
                <Text numberOfLines={1} style={[styles.location, {
                    color: colors.textSubtle,
                }]}>
                    {location}
                </Text>
                <ChevronDownIcon width={15} height={15} color={colors.textSubtle} />
            </Pressable>
            {isOpen ? (
                <View style={[styles.menu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    {options.map((option, index) => (
                        <Pressable
                            key={option}
                            accessibilityRole="button"
                            onPress={() => onSelect(option)}
                            style={[
                                styles.option,
                                index > 0 && {
                                    borderTopColor: colors.border,
                                    borderTopWidth: StyleSheet.hairlineWidth,
                                },
                            ]}
                        >
                            <Text style={[styles.location, { color: option === location ? colors.primary : colors.text }]}>
                                {option}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    root: { gap: 6 },
    button: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 8 },
    location: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: 11,
        lineHeight: 16,
    },
    menu: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
    option: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 12 },
});