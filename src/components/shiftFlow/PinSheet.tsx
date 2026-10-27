import { useState, type FC } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { BottomSheet, PrimaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

const PIN_LENGTH = 4;

/** Four-digit PIN entry (early end). Not in Figma. Mount it only while open. */
export const PinSheet: FC<{
  title: string;
  subtitle: string;
  confirmLabel: string;
  closeLabel: string;
  busy?: boolean;
  onSubmit: (pin: string) => void;
  onClose: () => void;
}> = ({ title, subtitle, confirmLabel, closeLabel, busy, onSubmit, onClose }) => {
  const { colors } = useTheme();
  const [pin, setPin] = useState('');

  return (
    <BottomSheet title={title} subtitle={subtitle} onClose={onClose} closeLabel={closeLabel}>
      <View style={styles.body}>
        <TextInput
          accessibilityLabel={title}
          autoFocus
          value={pin}
          onChangeText={v => setPin(v.replace(/\D/g, '').slice(0, PIN_LENGTH))}
          keyboardType="number-pad"
          placeholder={'•'.repeat(PIN_LENGTH)}
          placeholderTextColor={colors.textSubtle}
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
          ]}
          testID="pin-sheet-input"
        />
        <PrimaryButton
          label={confirmLabel}
          disabled={busy || pin.length !== PIN_LENGTH}
          onPress={() => onSubmit(pin)}
          testID="pin-sheet-confirm"
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  body: { gap: 16, marginTop: 8 },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    textAlign: 'center',
    letterSpacing: 12,
    fontFamily: FONTS.semiBold,
    fontSize: 22,
  },
});
