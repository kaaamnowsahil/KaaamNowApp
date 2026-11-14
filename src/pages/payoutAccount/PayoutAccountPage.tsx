import type { FC } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import QrCodeIcon from '@/assets/icons/qr-code.svg';
import TrashIcon from '@/assets/icons/trash-2.svg';
import UserIcon from '@/assets/figma/user.svg';
import WalletIcon from '@/assets/figma/wallet.svg';
import {
  BodyNote,
  IconField,
  PrimaryButton,
  SecondaryButton,
  ScreenIntro,
} from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import type { ROUTES } from '@/constants/routes';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps } from '@/types';

import { usePayoutAccount } from './hooks/usePayoutAccount';

const QrUploadSection: FC<{
  imageUri: string | null;
  onChoose: () => void;
  onRemove: () => void;
  error: string;
}> = ({ imageUri, onChoose, onRemove, error }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.qrSection}>
      <View style={styles.qrCopy}>
        <Text style={[styles.qrTitle, { color: colors.text }]}>
          {t('payoutAccount.qrLabel')}
        </Text>
        <Text style={[styles.qrHint, { color: colors.textSubtle }]}>
          {t('payoutAccount.qrHint')}
        </Text>
      </View>
      {imageUri ? (
        <Image
          accessibilityLabel={t('payoutAccount.qrAlt')}
          resizeMode="contain"
          source={{ uri: imageUri }}
          style={[styles.qrPreview, { backgroundColor: colors.fill, borderColor: colors.border }]}
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('payoutAccount.qrUpload')}
          onPress={onChoose}
          style={({ pressed }) => [
            styles.qrUpload,
            {
              borderColor: colors.border,
              backgroundColor: pressed ? colors.primarySoft : colors.fill,
            },
          ]}
          testID="payout-qr-upload"
        >
          <QrCodeIcon width={22} height={22} color={colors.primary} />
          <Text style={[styles.qrUploadLabel, { color: colors.primary }]}>
            {t('payoutAccount.qrUpload')}
          </Text>
        </Pressable>
      )}
      {imageUri ? (
        <View style={styles.qrActions}>
          <View style={styles.qrAction}>
            <SecondaryButton
              icon={QrCodeIcon}
              label={t('payoutAccount.qrChange')}
              onPress={onChoose}
              testID="payout-qr-change"
            />
          </View>
          <View style={styles.qrAction}>
            <SecondaryButton
              icon={TrashIcon}
              label={t('payoutAccount.qrRemove')}
              onPress={onRemove}
              tone="danger"
              testID="payout-qr-remove"
            />
          </View>
        </View>
      ) : null}
      {error ? <Text style={[styles.qrError, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
};

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
      busy={form.isSaving}
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
      <QrUploadSection
        imageUri={form.qrPreviewUri}
        onChoose={form.chooseQr}
        onRemove={form.removeQr}
        error={form.qrError}
      />
      {form.saveError ? <BodyNote>{form.saveError}</BodyNote> : null}
      <BodyNote>{t('payoutAccount.note')}</BodyNote>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  qrSection: { gap: 12 },
  qrCopy: { gap: 4 },
  qrTitle: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 20 },
  qrHint: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  qrUpload: {
    minHeight: 76,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  qrUploadLabel: { fontFamily: FONTS.semiBold, fontSize: 14 },
  qrPreview: { width: 156, height: 156, borderRadius: 14, borderWidth: 1 },
  qrActions: { flexDirection: 'row', gap: 10 },
  qrAction: { flex: 1 },
  qrError: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
});
