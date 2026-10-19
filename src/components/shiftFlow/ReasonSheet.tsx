import { useState, type FC } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  BottomSheet,
  ChipGroup,
  PrimaryButton,
  SecondaryButton,
} from '@/components/ui';
import type { Option } from '@/types';

/**
 * Pick-a-reason confirmation (cancel shift, decline offer). Not in Figma.
 * The confirm button is red and stays disabled until a reason is chosen.
 * Mount it only while open.
 */
export const ReasonSheet: FC<{
  title: string;
  subtitle: string;
  reasonLabel: string;
  reasons: Option[];
  confirmLabel: string;
  keepLabel: string;
  onConfirm: (reasonId: string) => void;
  onClose: () => void;
  testID?: string;
}> = ({
  title,
  subtitle,
  reasonLabel,
  reasons,
  confirmLabel,
  keepLabel,
  onConfirm,
  onClose,
  testID,
}) => {
  const [reasonId, setReasonId] = useState<string>();

  return (
    <BottomSheet
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      closeLabel={keepLabel}
      testID={testID}
    >
      <ChipGroup
        label={reasonLabel}
        options={reasons}
        selected={reasonId ? [reasonId] : []}
        onToggle={setReasonId}
      />
      <View style={styles.actions}>
        <PrimaryButton
          label={confirmLabel}
          tone="danger"
          disabled={!reasonId}
          onPress={() => reasonId && onConfirm(reasonId)}
          testID={testID ? `${testID}-confirm` : undefined}
        />
        <SecondaryButton label={keepLabel} onPress={onClose} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actions: { gap: 10, marginTop: 6 },
});
