import type { FC } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { BodyNote } from '@/components/ui';
import { FormScreen } from '@/layout/FormScreen';

import { FaqAccordion, HelpCard, SearchField } from './components';
import { FAQ_STRINGS } from './constants';
import { useFaq } from './hooks/useFaq';

/** Profile → FAQ & Help (Figma 13 · Account / Help). Questions: GET /content/faqs (admin-managed). */
export const FaqPage: FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const f = useFaq();

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('faq.title')}
      gap={16}
      isLoading={f.isLoading}
      testID="faq-page"
    >
      <SearchField
        value={f.query}
        placeholder={FAQ_STRINGS.SEARCH_PLACEHOLDER}
        onChangeText={f.setQuery}
      />
      {f.items.length ? (
        <FaqAccordion items={f.items} openId={f.openId} onToggle={f.toggle} />
      ) : (
        <BodyNote>{f.emptyMessage}</BodyNote>
      )}
      {f.canContactSupport ? (
        <HelpCard
          title={FAQ_STRINGS.HELP_TITLE}
          caption={FAQ_STRINGS.HELP_CAPTION}
          actionLabel={FAQ_STRINGS.CONTACT}
          onPress={f.contactSupport}
        />
      ) : null}
    </FormScreen>
  );
};
