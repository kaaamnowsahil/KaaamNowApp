import type { FC, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { BackButton } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

type FormScreenProps = {
  children: ReactNode;
  /** Pinned bottom bar ("Screen actions"). */
  actions: ReactNode;
  onBack?: () => void;
  testID?: string;
};

/**
 * Figma form-screen frame: 56px app bar (optional back button), scrollable
 * "Screen content" (16/24 vertical, 20 horizontal, 20 gap) and a top-bordered
 * "Screen actions" bar (12 top, 24 bottom + home-indicator inset).
 */
export const FormScreen: FC<FormScreenProps> = ({
  children,
  actions,
  onBack,
  testID,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.root, { backgroundColor: colors.background }]}
      testID={testID}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.appBar}>
          {onBack ? <BackButton onPress={onBack} /> : null}
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
        <View
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  appBar: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    gap: 20,
  },
  actions: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 20,
    gap: 10,
  },
});
