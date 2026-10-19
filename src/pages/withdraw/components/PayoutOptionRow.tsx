import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import CreditCardIcon from '@/assets/icons/credit-card.svg';
import QrCodeIcon from '@/assets/icons/qr-code.svg';
import { RadioCheck } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import type { PayoutOption } from '../mock';

/** One "Withdraw to" choice: lettered or icon tile, title, caption, radio. */
export const PayoutOptionRow: FC<{
  option: PayoutOption;
  selected: boolean;
  isLast: boolean;
  onPress: () => void;
}> = ({ option, selected, isLast, onPress }) => {
  const { colors } = useTheme();
  const AddIcon = option.addKind === 'bank' ? CreditCardIcon : QrCodeIcon;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${option.title}, ${option.caption}`}
      onPress={onPress}
      testID={`payout-option-${option.id}`}
      style={({ pressed }) => [
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.tile, { backgroundColor: colors.primarySoft }]}>
        {option.initial ? (
          <Text style={[styles.initial, { color: colors.primary }]}>
            {option.initial}
          </Text>
        ) : (
          <AddIcon width={16} height={16} color={colors.primary} />
        )}
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.text }]}>
          {option.title}
        </Text>
        <Text style={[styles.caption, { color: colors.textSubtle }]}>
          {option.caption}
        </Text>
      </View>
      <RadioCheck selected={selected} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressed: { opacity: 0.7 },
  tile: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { fontFamily: FONTS.semiBold, fontSize: 13, lineHeight: 18 },
  text: { flex: 1, gap: 1 },
  title: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 21 },
  caption: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 17 },
});
