import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import { formatRupees } from '@/utils/format';

type Props = {
  appliedCode: string | null;
  /** Discount on this checkout in paise, as priced by the server. */
  savedMinor: number;
  disabled: boolean;
  onOpen: () => void;
  onRemove: () => void;
};

const TicketPercentIcon: FC<{ color: string }> = ({ color }) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Path d="M2 9a3 3 0 1 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 1 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <Path d="M9 9h.01" />
    <Path d="m15 9-6 6" />
    <Path d="M15 15h.01" />
  </Svg>
);

/** Checkout entry to Apply Coupon; shows the applied code and what it saves. */
export const CouponRow: FC<Props> = ({
  appliedCode,
  savedMinor,
  disabled,
  onOpen,
  onRemove,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const smallButton = [
    styles.button,
    { borderColor: colors.border, backgroundColor: colors.surface },
    disabled && styles.disabled,
  ];

  return (
    <View
      accessibilityLabel={t('coupons.row.label')}
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      testID="coupon-row"
    >
      <TicketPercentIcon color={colors.primary} />
      {appliedCode ? (
        <>
          <View style={styles.text}>
            <Text style={[styles.applied, { color: colors.text }]}>
              {t('coupons.row.applied', { code: appliedCode.toUpperCase() })}
            </Text>
            {savedMinor > 0 ? (
              <Text style={[styles.saved, { color: colors.success }]}>
                {t('coupons.row.saved', {
                  amount: formatRupees(savedMinor / 100),
                })}
              </Text>
            ) : null}
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={onOpen}
              style={smallButton}
              testID="coupon-row-change"
            >
              <Text style={[styles.buttonText, { color: colors.primary }]}>
                {t('coupons.row.change')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={() => !disabled && onRemove()}
              style={smallButton}
              testID="coupon-row-remove"
            >
              <Text style={[styles.buttonText, { color: colors.primary }]}>
                {t('coupons.remove')}
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onOpen}
          style={[
            styles.button,
            styles.open,
            { borderColor: colors.primary, backgroundColor: colors.surface },
            disabled && styles.disabled,
          ]}
          testID="coupon-row-open"
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            {t('coupons.row.apply')}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  text: { flex: 1, minWidth: 0, gap: 2 },
  applied: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 20 },
  saved: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: 'row', gap: 8 },
  button: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
  },
  open: { flex: 1, borderStyle: 'dashed' },
  buttonText: { fontFamily: FONTS.semiBold, fontSize: 13 },
  disabled: { opacity: 0.5 },
});
