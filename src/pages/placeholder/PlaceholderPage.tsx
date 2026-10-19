import { useRoute } from '@react-navigation/native';
import type { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BodyNote, ScreenIntro, SecondaryButton } from '@/components/ui';
import { useAuthStore } from '@/services/auth/useAuthStore';
import { useTheme } from '@/theme/ThemeProvider';

import {
  PLACEHOLDER_SCREENS,
  PLACEHOLDER_STRINGS,
} from './constants/placeholderStrings';

/** Temporary stand-in for tab / common screens until each is built from Figma. */
export const PlaceholderPage: FC = () => {
  const { colors } = useTheme();
  const { name } = useRoute();
  const isAuth = useAuthStore(s => s.isAuth);
  const signOut = useAuthStore(s => s.signOut);
  const screen = PLACEHOLDER_SCREENS[name] ?? { title: name, figma: '—' };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <ScreenIntro title={screen.title} />
        <BodyNote>{PLACEHOLDER_STRINGS.pending(screen.figma)}</BodyNote>
        {isAuth ? (
          <SecondaryButton
            label={PLACEHOLDER_STRINGS.SIGN_OUT}
            onPress={signOut}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, gap: 20 },
});
