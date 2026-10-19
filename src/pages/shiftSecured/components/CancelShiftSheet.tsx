import { useState, type FC } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  BottomSheet,
  ChipGroup,
  PrimaryButton,
  SecondaryButton,
} from '@/components/ui';
import type { Option } from '@/types';

import { SHIFT_SECURED_STRINGS as S } from '../constants';

/** Cancel confirmation for a secured shift. Not in Figma. Mount it only while open. */
export const CancelShiftSheet: FC<{
  reasons: Option[];
  lateWindow: string;
  onConfirm: (reasonId: string) => void;
  onClose: () => void;
}> = ({ reasons, lateWindow, onConfirm, onClose }) => {
  const [reasonId, setReasonId] = useState<string>();

  return (
    <BottomSheet
      title={S.CANCEL_TITLE}
      subtitle={S.cancelBody(lateWindow)}
      onClose={onClose}
      closeLabel={S.KEEP}
      testID="cancel-shift-sheet"
    >
      <ChipGroup
        label={S.CANCEL_REASON}
        options={reasons}
        selected={reasonId ? [reasonId] : []}
        onToggle={setReasonId}
      />
      <View style={styles.actions}>
        <PrimaryButton
          label={S.CANCEL_CONFIRM}
          tone="danger"
          disabled={!reasonId}
          onPress={() => reasonId && onConfirm(reasonId)}
          testID="cancel-shift-confirm"
        />
        <SecondaryButton label={S.KEEP} onPress={onClose} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actions: { gap: 10, marginTop: 6 },
});
