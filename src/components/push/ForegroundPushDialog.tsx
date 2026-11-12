import type { FC } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import InfoIcon from '@/assets/icons/info.svg';
import { FONTS } from '@/constants/fonts';
import { tr } from '@/services/i18n/tr';
import { useTheme } from '@/theme/ThemeProvider';

type Props = {
  title: string;
  body: string;
  onClose: () => void;
  onView: () => void;
};

/** Branded replacement for the platform alert shown for foreground pushes. */
export const ForegroundPushDialog: FC<Props> = ({
  title,
  body,
  onClose,
  onView,
}) => {
  const { colors } = useTheme();

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible
    >
      <View style={[styles.backdrop, { backgroundColor: colors.backdrop }]}>
        <Pressable
          accessibilityLabel={tr('common.close')}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          testID="foreground-push-dialog"
        >
          <View style={styles.heading}>
            <View
              style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}
            >
              <InfoIcon width={22} height={22} color={colors.primary} />
            </View>
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: colors.text }]}
            >
              {title}
            </Text>
            {body ? (
              <Text style={[styles.body, { color: colors.textMuted }]}>
                {body}
              </Text>
            ) : null}
          </View>
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                styles.action,
                styles.secondary,
                { borderColor: colors.border },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.actionText, { color: colors.textMuted }]}>
                {tr('common.close')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onView}
              style={({ pressed }) => [
                styles.action,
                styles.primary,
                { backgroundColor: colors.primary },
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.actionText, { color: colors.onPrimary }]}>
                {tr('common.view')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 22,
    padding: 22,
    gap: 22,
    elevation: 12,
  },
  heading: { gap: 10 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: FONTS.bold, fontSize: 19, lineHeight: 26 },
  body: { fontFamily: FONTS.regular, fontSize: 15, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 10 },
  action: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  secondary: { backgroundColor: 'transparent' },
  primary: { borderColor: 'transparent' },
  actionText: { fontFamily: FONTS.semiBold, fontSize: 14 },
  pressed: { opacity: 0.7 },
});
