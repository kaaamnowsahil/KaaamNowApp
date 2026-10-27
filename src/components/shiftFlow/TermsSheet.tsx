import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

import { BottomSheet, PrimaryButton, TextButton } from '@/components/ui';
import { errorMessage } from '@/services/api/apiClient';
import { termsApi, type TermsAudience } from '@/services/terms/termsApi';

/**
 * Records terms acceptance, then calls `onAccepted` (which runs the blocked action).
 * Mount it only while open. Copy can be overridden (e.g. the worker "Book this shift" sheet).
 */
export const TermsSheet: FC<{
  audience: TermsAudience;
  onAccepted: () => void;
  onRead: () => void;
  onClose: () => void;
  title?: string;
  body?: string;
  acceptLabel?: string;
  readLabel?: string;
}> = ({
  audience,
  onAccepted,
  onRead,
  onClose,
  title,
  body,
  acceptLabel,
  readLabel,
}) => {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const accept = async () => {
    setBusy(true);
    try {
      await termsApi.accept(audience);
      onAccepted();
    } catch (error) {
      Alert.alert(t('termsSheet.failed'), errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet
      title={title ?? t('termsSheet.title')}
      subtitle={body ?? t(`termsSheet.${audience}`)}
      onClose={onClose}
      closeLabel={t('termsSheet.later')}
      testID="terms-sheet"
    >
      <View style={styles.actions}>
        <PrimaryButton
          label={acceptLabel ?? t('termsSheet.accept')}
          disabled={busy}
          onPress={accept}
          testID="terms-sheet-accept"
        />
        <TextButton
          label={readLabel ?? t('termsSheet.read')}
          tone="primary"
          onPress={onRead}
        />
        <TextButton label={t('termsSheet.later')} onPress={onClose} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actions: { gap: 12, marginTop: 8 },
});
