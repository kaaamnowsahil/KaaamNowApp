import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@/constants/fonts';
import { BRAND } from '@/constants/brand';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';

const PRIVACY_SECTIONS = [
  'data',
  'use',
  'location',
  'sharing',
  'security',
  'contact',
] as const;

export const PrivacyPolicyPage: FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const emails = BRAND.SUPPORT_EMAILS.join(' or ');

  return (
    <FormScreen
      onBack={navigation.goBack}
      backVariant="plain"
      title={t('privacy.title')}
      gap={18}
      testID="privacy-policy-page"
    >
      <Text style={[styles.updated, { color: colors.textSubtle }]}>
        {t('privacy.updated')}
      </Text>
      {PRIVACY_SECTIONS.map(section => (
        <View key={section} style={styles.section}>
          <Text style={[styles.heading, { color: colors.text }]}>
            {t(`privacy.sections.${section}Title`)}
          </Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>
            {t(`privacy.sections.${section}Body`, { emails })}
          </Text>
        </View>
      ))}
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  updated: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 17 },
  section: { gap: 6 },
  heading: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 22 },
  body: { fontFamily: FONTS.regular, fontSize: 12.5, lineHeight: 21 },
});
