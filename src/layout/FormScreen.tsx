import { Children, type FC, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { BackButton, Loader, Rise } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { MOTION } from '@/constants/motion';
import { useTheme } from '@/theme/ThemeProvider';

type FormScreenProps = {
  children: ReactNode;
  /** Pinned bottom bar ("Screen actions"); omitted on read-only screens. */
  actions?: ReactNode;
  onBack?: () => void;
  /** Small title beside the back button. */
  title?: string;
  /** Second line under `title`, e.g. "Worker mode / Live request". */
  subtitle?: string;
  /** 14px title like Figma "Worker mode" bars, instead of 17px. */
  compactTitle?: boolean;
  /** Right side of the app bar, e.g. a text action. */
  headerRight?: ReactNode;
  /** Small muted label on the right of the app bar, e.g. "Worker". */
  headerTag?: string;
  /** Space between content blocks; forms use 20. */
  gap?: number;
  /** Additional layout for the scrollable content container. */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Shows the brand loader instead of the content and actions. */
  isLoading?: boolean;
  /** Shows the brand loader over the content while an action runs. */
  busy?: boolean;
  /** Content sits on a rounded panel with a handle over a filled bar (Finish your shift?). */
  asSheet?: boolean;
  /** Last child grows to fill the remaining height (centered empty states). */
  fillLastBlock?: boolean;
  testID?: string;
};

/**
 * Figma form-screen frame: 56px app bar (optional back button), scrollable
 * "Screen content" (16/24 vertical, 20 horizontal, 20 gap) and a top-bordered
 * "Screen actions" bar (12 top, 24 bottom + home-indicator inset).
 * Each direct child rises in on mount, staggered; the actions bar comes last.
 */
export const FormScreen: FC<FormScreenProps> = ({
  children,
  actions,
  onBack,
  title,
  subtitle,
  compactTitle,
  headerRight,
  headerTag,
  gap = 20,
  contentContainerStyle,
  isLoading,
  busy,
  asSheet,
  fillLastBlock,
  testID,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const blocks = Children.toArray(children);
  const outerBg = asSheet ? colors.fill : colors.background;

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.root, { backgroundColor: outerBg }]}
      testID={testID}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.appBar}>
          {onBack ? (
            <Rise>
              <BackButton onPress={onBack} />
            </Rise>
          ) : null}
          {title && subtitle ? (
            <View style={styles.titleBlock}>
              <Text
                accessibilityRole="header"
                numberOfLines={1}
                style={[styles.titleSmall, { color: colors.text }]}
              >
                {title}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.subtitle, { color: colors.textSubtle }]}
              >
                {subtitle}
              </Text>
            </View>
          ) : title ? (
            <Text
              accessibilityRole="header"
              numberOfLines={1}
              style={[
                compactTitle ? [styles.titleSmall, styles.flex] : styles.title,
                { color: colors.text },
              ]}
            >
              {title}
            </Text>
          ) : null}
          {headerRight ? (
            <View style={styles.headerRight}>{headerRight}</View>
          ) : headerTag ? (
            <Text
              numberOfLines={1}
              style={[
                styles.headerRight,
                styles.headerTag,
                { color: colors.textSubtle },
              ]}
            >
              {headerTag}
            </Text>
          ) : null}
        </View>
        <View
          style={[
            styles.root,
            asSheet && [styles.sheet, { backgroundColor: colors.background }],
          ]}
        >
          {asSheet ? (
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          ) : null}
          {isLoading ? null : (
            <ScrollView
              contentContainerStyle={[
                styles.content,
                asSheet && styles.sheetContent,
                fillLastBlock && styles.fill,
                { gap },
                contentContainerStyle,
              ]}
              keyboardShouldPersistTaps="handled"
            >
              {blocks.map((block, i) => (
                <Rise
                  key={i}
                  delay={(i + 1) * MOTION.stagger}
                  style={fillLastBlock && i === blocks.length - 1 ? styles.fill : undefined}
                >
                  {block}
                </Rise>
              ))}
            </ScrollView>
          )}
        </View>
        {actions && !isLoading ? (
          <Rise
            delay={(blocks.length + 1) * MOTION.stagger}
            style={[
              styles.actions,
              {
                backgroundColor: colors.background,
                borderTopColor: colors.border,
                paddingBottom: 24 + insets.bottom,
              },
            ]}
          >
            {actions}
          </Rise>
        ) : null}
      </KeyboardAvoidingView>
      {isLoading || busy ? <Loader /> : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flexGrow: 1 },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  handle: {
    alignSelf: 'center',
    width: 32,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  sheetContent: { paddingTop: 14 },
  appBar: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 17,
    lineHeight: 25,
  },
  titleBlock: { flex: 1 },
  flex: { flex: 1 },
  titleSmall: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 21 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16.5 },
  headerRight: { marginLeft: 'auto' },
  headerTag: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16.5 },
  content: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  actions: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 20,
    gap: 10,
  },
});
