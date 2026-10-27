import type { FC } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { DeletionDetailProps } from '@/types';

import { styles } from './deletionRequest.styles';

export const DeletionDetail: FC<DeletionDetailProps> = ({ label, value }) => {
  const { colors } = useTheme();
  if (!value) return null;
  return (
    <View style={styles.detail}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
};
