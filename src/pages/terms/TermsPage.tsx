import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@/constants/fonts';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';

import { useTerms } from './hooks/useTerms';

/** Profile / Sign-up → Terms & Conditions (Figma 13 · Account / Terms). Copy: GET /content/terms (admin-managed). */
export const TermsPage: FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const terms = useTerms();

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('terms.title')}
      gap={18}
      isLoading={terms.isLoading}
      testID="terms-page"
    >
      {terms.lastUpdated ? (
        <Text style={[styles.updated, { color: colors.textSubtle }]}>
          {terms.lastUpdated}
        </Text>
      ) : null}
      {terms.emptyMessage ? (
        <Text style={[styles.body, { color: colors.textMuted }]}>
          {terms.emptyMessage}
        </Text>
      ) : null}
      {terms.sections.map(section => (
        <View key={section.id} style={styles.section}>
          <Text style={[styles.heading, { color: colors.text }]}>
            {section.title}
          </Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>
            {section.body}
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
