import { useState, type FC } from 'react';
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
import { useMockLoading } from '@/shared/hooks/useMockLoading';
import type { AppScreenProps } from '@/types';

import { PAYOUT_ACCOUNT } from './mock';

const UPI_PATTERN = /^[\w.-]{2,}@[a-zA-Z]{2,}$/;

/** Profile → Payout account and Earnings → Payout method. Data: mock/payoutAccountMock.ts */
export const PayoutAccountPage: FC<
  AppScreenProps<typeof ROUTES.payoutAccount>
> = ({ navigation }) => {
  const { t } = useTranslation();
  const isLoading = useMockLoading();
  const [holderName, setHolderName] = useState(PAYOUT_ACCOUNT.holderName);
  const [upiId, setUpiId] = useState(PAYOUT_ACCOUNT.upiId);
  const isUnchanged =
    upiId === PAYOUT_ACCOUNT.upiId && holderName === PAYOUT_ACCOUNT.holderName;
  const upiValid = UPI_PATTERN.test(upiId.trim());
  const nameValid = holderName.trim().length >= 2;

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('payoutAccount.title')}
      isLoading={isLoading}
      testID="payout-account-page"
      actions={
        <PrimaryButton
          label={t('payoutAccount.save')}
          disabled={!upiValid || !nameValid || isUnchanged}
          onPress={navigation.goBack}
          testID="payout-save"
        />
      }
    >
      <ScreenIntro
        title={t('payoutAccount.introTitle')}
        subtitle={t('payoutAccount.introSubtitle')}
      />
      <IconField
        label={t('payoutAccount.holderLabel')}
        icon={UserIcon}
        placeholder={t('payoutAccount.holderPlaceholder')}
        value={holderName}
        onChangeText={setHolderName}
        autoCapitalize="words"
        error={holderName && !nameValid ? t('payoutAccount.nameError') : undefined}
        testID="payout-holder"
      />
      <IconField
        label={t('payoutAccount.upiLabel')}
        icon={WalletIcon}
        placeholder={t('payoutAccount.upiPlaceholder')}
        value={upiId}
        onChangeText={v => setUpiId(v.trim())}
        autoCapitalize="none"
        keyboardType="email-address"
        action={
          upiId === PAYOUT_ACCOUNT.upiId && PAYOUT_ACCOUNT.isVerified
            ? { label: t('payoutAccount.verified'), tone: 'success' }
            : undefined
        }
        error={upiId && !upiValid ? t('payoutAccount.upiError') : undefined}
        testID="payout-upi"
      />
      <BodyNote>{t('payoutAccount.note')}</BodyNote>
    </FormScreen>
  );
};
