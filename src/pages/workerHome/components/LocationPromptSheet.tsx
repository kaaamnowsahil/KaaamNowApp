import type { FC } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MapPinIcon from '@/assets/figma/map-pin.svg';
import { PrimaryButton, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { WORKER_HOME_STRINGS } from '../constants';

type LocationPromptSheetProps = {
  isPending: boolean;
  error: string | null;
  onShare: () => void;
  onClose: () => void;
};

/** Mirrors the web "Share your location to go online" sheet. Mount it only while open. */
export const LocationPromptSheet: FC<LocationPromptSheetProps> = ({
  isPending,
  error,
  onShare,
  onClose,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const strings = WORKER_HOME_STRINGS.AVAILABILITY;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityLabel={strings.PROMPT_CANCEL}
          style={[styles.backdrop, { backgroundColor: colors.backdrop }]}
          onPress={onClose}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              paddingBottom: 24 + insets.bottom,
            },
          ]}
          testID="location-prompt-sheet"
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
            <MapPinIcon width={24} height={24} color={colors.primary} />
          </View>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            {strings.PROMPT_TITLE}
          </Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>
            {strings.PROMPT_BODY}
          </Text>
          {error ? (
            <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>
              {error}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <View style={styles.action}>
              <SecondaryButton label={strings.PROMPT_CANCEL} onPress={onClose} />
            </View>
            <View style={styles.action}>
              <PrimaryButton
                label={isPending ? strings.PROMPT_LOADING : strings.PROMPT_SHARE}
                onPress={onShare}
                disabled={isPending}
                testID="location-prompt-share"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: StyleSheet.absoluteFill,
  sheet: {
    alignItems: 'center',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  handle: { width: 40, height: 4, borderRadius: 2 },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 16,
  },
  title: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 26, textAlign: 'center' },
  body: {
    marginTop: 10,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  error: {
    alignSelf: 'stretch',
    marginTop: 12,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 22, alignSelf: 'stretch' },
  action: { flex: 1 },
});
