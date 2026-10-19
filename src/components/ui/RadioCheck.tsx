import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import CheckIcon from '@/assets/icons/check.svg';
import { useTheme } from '@/theme/ThemeProvider';

/** 20px round selector: filled purple with a check when selected, outlined otherwise (12 · Withdraw). */
export const RadioCheck: FC<{ selected: boolean }> = ({ selected }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.mark,
        selected
          ? { backgroundColor: colors.primary, borderColor: colors.primary }
          : { borderColor: colors.textSubtle },
      ]}
    >
      {selected ? (
        <CheckIcon width={12} height={12} color={colors.onPrimary} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  mark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
