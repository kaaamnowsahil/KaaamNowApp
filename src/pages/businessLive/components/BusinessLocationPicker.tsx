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
                    hitSlop={6}
                    onPress={onToggle}
                    style={styles.button}
                    testID="business-location"
                >
                    <MapPinIcon width={18} height={18} color={colors.primary} />
                    <Text numberOfLines={1} style={[styles.location, {
                        color: colors.textMuted,
                    }]}>
                        {location}
                    </Text>
                    <View style={isOpen && styles.flipped}>
                        <ChevronDownIcon width={16} height={16} color={colors.textMuted} />
                    </View>
                </Pressable>
                {isOpen ? (
                    <View
                        accessibilityRole="menu"
                        style={[
                            styles.menu,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                        ]}
                        testID="business-location-menu"
                    >
                        <Text style={[styles.hint, { color: colors.textSubtle }]}>
                            {t('businessDashboard.locationPickerHint')}
                        </Text>
                        {options.map((option, index) => {
                            const selected = option === location;
                            return (
                            <Pressable
                                key={option}
                                accessibilityRole="menuitem"
                                accessibilityState={{ selected }}
                                onPress={() => onSelect(option)}
                                style={({ pressed }) => [
                                    styles.option,
                                    index > 0 && {
                                        borderTopColor: colors.border,
                                        borderTopWidth: 1,
                                    },
                                    pressed && { backgroundColor: colors.fill },
                                ]}
                                testID={`business-location-option-${index}`}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        selected && styles.optionSelected,
                                        { color: selected ? colors.primary : colors.text },
                                    ]}
                                >
                                    {option}
                                </Text>
                                {selected ? (
                                    <View
                                        style={[
                                            styles.dot,
                                            { backgroundColor: colors.primary },
                                        ]}
                                    />
                                ) : null}
                            </Pressable>
                            );
                        })}
                    </View>
                ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    root: { gap: 8 },
    button: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 8 },
    location: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: 13,
        lineHeight: 18.2,
    },
    flipped: { transform: [{ rotate: '180deg' }] },
    menu: { borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
    hint: {
        fontFamily: FONTS.semiBold,
        fontSize: 11,
        lineHeight: 16.5,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 4,
    },
    option: {
        minHeight: 44,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    optionText: {
        flex: 1,
        fontFamily: FONTS.regular,
        fontSize: 14,
        lineHeight: 19.6,
    },
    optionSelected: { fontFamily: FONTS.semiBold },
    dot: { width: 8, height: 8, borderRadius: 4 },
});