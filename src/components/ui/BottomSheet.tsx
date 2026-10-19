import type { FC, ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Slide-up sheet with a handle, title and optional note, matching the
 * Finish-your-shift sheet. Mount it only while open.
 */
export const BottomSheet: FC<{
  title: string;
  subtitle?: string;
  onClose: () => void;
  closeLabel: string;
  children: ReactNode;
  testID?: string;
}> = ({ title, subtitle, onClose, closeLabel, children, testID }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityLabel={closeLabel}
          style={[styles.backdrop, { backgroundColor: colors.backdrop }]}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              paddingBottom: 24 + insets.bottom,
            },
          ]}
          testID={testID}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.heading}>
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: colors.text }]}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: StyleSheet.absoluteFill,
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },
  handle: { alignSelf: 'center', width: 32, height: 4, borderRadius: 2 },
  heading: { gap: 4, marginTop: 6 },
  title: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 26 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18.2 },
});
