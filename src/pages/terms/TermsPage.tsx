import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { FONTS } from '@/constants/fonts';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';

import { TERMS_STRINGS as S } from './constants';
import { TERMS_SECTIONS } from './mock';

/** Profile / Sign-up → Terms & Conditions (Figma 13 · Account / Terms). Copy: mock/termsMock.ts */
export const TermsPage: FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colors } = useTheme();

  return (
    <FormScreen
      onBack={navigation.goBack}
      backVariant="plain"
      title={t('terms.title')}
      gap={18}
      testID="terms-page"
    >
      <Text style={[styles.updated, { color: colors.textSubtle }]}>
        {S.LAST_UPDATED}
      </Text>
      {TERMS_SECTIONS.map((section, index) => (
        <View key={section.id} style={styles.section}>
          <Text style={[styles.heading, { color: colors.text }]}>
            {S.sectionTitle(index + 1, section.title)}
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
