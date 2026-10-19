import type { FC } from 'react';
import { useNavigation } from '@react-navigation/native';

import { BodyNote } from '@/components/ui';
import { FormScreen } from '@/layout/FormScreen';

import { FaqAccordion, HelpCard, SearchField } from './components';
import { FAQ_STRINGS as S } from './constants';
import { useFaq } from './hooks/useFaq';

/** Profile → FAQ & Help (Figma 13 · Account / Help). Questions: mock/faqMock.ts */
export const FaqPage: FC = () => {
  const navigation = useNavigation();
  const f = useFaq();

  return (
    <FormScreen
      onBack={navigation.goBack}
      backVariant="plain"
      title={S.TITLE}
      gap={16}
      isLoading={f.isLoading}
      testID="faq-page"
    >
      <SearchField
        value={f.query}
        placeholder={S.SEARCH_PLACEHOLDER}
        onChangeText={f.setQuery}
      />
      {f.items.length ? (
        <FaqAccordion items={f.items} openId={f.openId} onToggle={f.toggle} />
      ) : (
        <BodyNote>{S.NO_RESULTS}</BodyNote>
      )}
      <HelpCard
        title={S.HELP_TITLE}
        caption={S.HELP_CAPTION}
        actionLabel={S.CONTACT}
        onPress={f.contactSupport}
      />
    </FormScreen>
  );
};
