import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { BRAND } from '@/constants/brand';
import { FONTS } from '@/constants/fonts';
import { useAppVersion } from '@/services/system/useAppVersion';
import { useTheme } from '@/theme/ThemeProvider';

/** Registered company name under the profile settings, with the live platform version. */
export const LegalFooter: FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const appVersion = useAppVersion();
  return (
    <View style={styles.block} testID="profile-legal">
      <Text style={[styles.text, { color: colors.textSubtle }]}>
        © {new Date().getFullYear()} {BRAND.COMPANY_LEGAL_NAME}
      </Text>
      {appVersion ? (
        <Text style={[styles.text, { color: colors.textSubtle }]}>
          {t('common.appVersion', { version: appVersion })}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  block: { alignItems: 'center', gap: 2, marginBottom: 8 },
  text: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});
