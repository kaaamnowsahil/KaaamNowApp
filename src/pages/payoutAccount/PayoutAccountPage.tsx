import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

import UserIcon from '@/assets/figma/user.svg';
import WalletIcon from '@/assets/figma/wallet.svg';
import {
  BodyNote,
  IconField,
  PrimaryButton,
  ScreenIntro,
} from '@/components/ui';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import type { AppScreenProps } from '@/types';

import { usePayoutAccount } from './hooks/usePayoutAccount';

/** Profile → Payout account and Earnings → Payout method. Data: hooks/usePayoutAccount.ts */
export const PayoutAccountPage: FC<
  AppScreenProps<typeof ROUTES.payoutAccount>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const form = usePayoutAccount(navigation.goBack);

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('payoutAccount.title')}
      isLoading={form.isLoading}
      testID="payout-account-page"
      actions={
        form.loadError ? (
          <PrimaryButton
            label={t('withdraw.retry')}
            onPress={form.reload}
            testID="payout-retry"
          />
        ) : (
          <PrimaryButton
            label={
              form.isSaving
                ? t('payoutAccount.saving')
                : t('payoutAccount.save')
            }
            disabled={!form.canSave}
            onPress={form.save}
            testID="payout-save"
          />
        )
      }
    >
      <ScreenIntro
        title={t('payoutAccount.introTitle')}
        subtitle={t('payoutAccount.introSubtitle')}
      />
      {form.loadError ? <BodyNote>{form.loadError}</BodyNote> : null}
      <IconField
        label={t('payoutAccount.holderLabel')}
        icon={UserIcon}
        placeholder={t('payoutAccount.holderPlaceholder')}
        value={form.holderName}
        onChangeText={form.setHolderName}
        autoCapitalize="words"
        error={
          form.holderName && !form.nameValid
            ? t('payoutAccount.nameError')
            : undefined
        }
        testID="payout-holder"
      />
      <IconField
        label={t('payoutAccount.upiLabel')}
        icon={WalletIcon}
        placeholder={t('payoutAccount.upiPlaceholder')}
        value={form.upiId}
        onChangeText={form.setUpiId}
        autoCapitalize="none"
        keyboardType="email-address"
        action={
          form.isVerified
            ? { label: t('payoutAccount.verified'), tone: 'success' }
            : undefined
        }
        error={
          form.upiId && !form.upiValid ? t('payoutAccount.upiError') : undefined
        }
        testID="payout-upi"
      />
      {form.saveError ? <BodyNote>{form.saveError}</BodyNote> : null}
      <BodyNote>{t('payoutAccount.note')}</BodyNote>
    </FormScreen>
  );
};
