import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ChevronRightIcon from '@/assets/figma/chevron-right.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type BusinessDraftCardProps = {
  title: string;
  date: string;
  onPress: () => void;
};

export const BusinessDraftCard: FC<BusinessDraftCardProps> = ({
  title,
  date,
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
        <Text style={[styles.status, { color: colors.primary }]}>
          {t('businessShiftCreate.draftStatus')}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.meta, { color: colors.textSubtle }]}>{date}</Text>
      </View>
      <ChevronRightIcon width={18} height={18} color={colors.textSubtle} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pressed: { opacity: 0.88 },
  copy: { flex: 1, gap: 3 },
  status: {
    fontFamily: FONTS.semiBold,
    fontSize: 10,
    lineHeight: 15,
  },
  title: { fontFamily: FONTS.regular, fontSize: 14, lineHeight: 19 },
  meta: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
});
