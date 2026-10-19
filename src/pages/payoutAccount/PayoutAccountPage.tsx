import { useState, type FC } from 'react';

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

import { PAYOUT_ACCOUNT_STRINGS as S } from './constants';
import { PAYOUT_ACCOUNT } from './mock';

const UPI_PATTERN = /^[\w.-]{2,}@[a-zA-Z]{2,}$/;

/** Profile → Payout account and Earnings → Payout method. Data: mock/payoutAccountMock.ts */
export const PayoutAccountPage: FC<
  AppScreenProps<typeof ROUTES.payoutAccount>
> = ({ navigation }) => {
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
      title={S.TITLE}
      isLoading={isLoading}
      testID="payout-account-page"
      actions={
        <PrimaryButton
          label={S.SAVE}
          disabled={!upiValid || !nameValid || isUnchanged}
          onPress={navigation.goBack}
          testID="payout-save"
        />
      }
    >
      <ScreenIntro title={S.INTRO_TITLE} subtitle={S.INTRO_SUBTITLE} />
      <IconField
        label={S.HOLDER_LABEL}
        icon={UserIcon}
        placeholder={S.HOLDER_PLACEHOLDER}
        value={holderName}
        onChangeText={setHolderName}
        autoCapitalize="words"
        error={holderName && !nameValid ? S.NAME_ERROR : undefined}
        testID="payout-holder"
      />
      <IconField
        label={S.UPI_LABEL}
        icon={WalletIcon}
        placeholder={S.UPI_PLACEHOLDER}
        value={upiId}
        onChangeText={v => setUpiId(v.trim())}
        autoCapitalize="none"
        keyboardType="email-address"
        action={
          upiId === PAYOUT_ACCOUNT.upiId && PAYOUT_ACCOUNT.isVerified
            ? { label: S.VERIFIED, tone: 'success' }
            : undefined
        }
        error={upiId && !upiValid ? S.UPI_ERROR : undefined}
        testID="payout-upi"
      />
      <BodyNote>{S.NOTE}</BodyNote>
    </FormScreen>
  );
};
