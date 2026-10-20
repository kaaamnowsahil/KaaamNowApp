import type { FC } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { PopIn } from './motion';
import { OutlineButton } from './OutlineButton';

/** Figma "Discover empty states" (08): icon tile, title, note, outlined action. */
export const EmptyState: FC<{
  icon: FC<SvgProps>;
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  testID?: string;
}> = ({ icon: Icon, title, body, action, onAction, testID }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.root} testID={testID}>
      <PopIn
        style={[styles.tile, { backgroundColor: colors.primarySoft }]}
      >
        <Icon width={26} height={26} color={colors.primary} />
      </PopIn>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textSubtle }]}>{body}</Text>
      {action && onAction ? (
        <View style={styles.action}>
          <OutlineButton label={action} onPress={onAction} tone="primary" />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 8,
    flex: 1
  },
  tile: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 17,
    lineHeight: 23.8,
    textAlign: 'center',
  },
  body: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16.8,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  action: { alignSelf: 'stretch', marginTop: 8 },
});
