import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import CheckIcon from '@/assets/icons/check.svg';
import { PopIn } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/** "Your shift is secured" / "Shift completed" header: green overline, centred icon, title. */
export const StatusHero: FC<{
  overline: string;
  title: string;
  subtitle: string;
  icon?: FC<SvgProps>;
}> = ({ overline, title, subtitle, icon: Icon = CheckIcon }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.root}>
      <Text style={[styles.overline, { color: colors.success }]}>
        {overline}
      </Text>
      <PopIn
        style={[
          styles.icon,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        <View style={[styles.ring, { borderColor: colors.success }]}>
          <Icon width={14} height={14} color={colors.success} />
        </View>
      </PopIn>
      <Text
        accessibilityRole="header"
        style={[styles.title, { color: colors.text }]}
      >
        {title}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { gap: 4 },
  overline: { fontFamily: FONTS.semiBold, fontSize: 10, lineHeight: 14 },
  icon: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 28,
  },
  ring: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 26 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
});
