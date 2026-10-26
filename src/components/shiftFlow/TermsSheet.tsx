import { useState, type FC } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { BottomSheet, PrimaryButton, TextButton } from '@/components/ui';
import { errorMessage } from '@/services/api/apiClient';
import { termsApi, type TermsAudience } from '@/services/terms/termsApi';

const TERMS_SHEET_STRINGS = {
  TITLE: 'Accept our Terms & Conditions',
  worker: 'Before your first booking, please read and accept the worker terms: payments, cancellations, strikes and conduct on the job.',
  business: 'Before your first post, please read and accept the business terms: fees, cancellations and how bookings work.',
  READ: 'Read the terms',
  ACCEPT: 'I agree',
  LATER: 'Not now',
  FAILED: 'Couldn’t save your acceptance',
} as const;

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
  title = TERMS_SHEET_STRINGS.TITLE,
  body = TERMS_SHEET_STRINGS[audience],
  acceptLabel = TERMS_SHEET_STRINGS.ACCEPT,
  readLabel = TERMS_SHEET_STRINGS.READ,
}) => {
  const [busy, setBusy] = useState(false);

  const accept = async () => {
    setBusy(true);
    try {
      await termsApi.accept(audience);
      onAccepted();
    } catch (error) {
      Alert.alert(TERMS_SHEET_STRINGS.FAILED, errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <BottomSheet
      title={title}
      subtitle={body}
      onClose={onClose}
      closeLabel={TERMS_SHEET_STRINGS.LATER}
      testID="terms-sheet"
    >
      <View style={styles.actions}>
        <PrimaryButton
          label={acceptLabel}
          disabled={busy}
          onPress={accept}
          testID="terms-sheet-accept"
        />
        <TextButton label={readLabel} tone="primary" onPress={onRead} />
        <TextButton label={TERMS_SHEET_STRINGS.LATER} onPress={onClose} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actions: { gap: 12, marginTop: 8 },
});
