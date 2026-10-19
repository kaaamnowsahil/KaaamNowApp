import type { FC, ReactElement, ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Loader, Rise } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { MOTION } from '@/constants/motion';
import { useTheme } from '@/theme/ThemeProvider';

type TabScreenProps = {
  /** Plain 22px bold app-bar title; ignored when `header` is given. */
  title?: string;
  /** Custom app-bar content, e.g. the brand bar on Discover. */
  header?: ReactNode;
  /** Each block rises in on mount, staggered. Give every block a key. */
  blocks: ReactElement[];
  /** Space between blocks; Discover uses 8, Profile 10. */
  gap?: number;
  /** Shows the brand loader instead of the blocks. */
  isLoading?: boolean;
  testID?: string;
};

/**
 * Bottom-tab screen frame from Figma Discover (1:1456): 56px app bar and a
 * scrollable "Screen content" (12 top, 20 bottom, 20 horizontal, 8 gap).
 */
export const TabScreen: FC<TabScreenProps> = ({
  title,
  header,
  blocks,
  gap = 8,
  isLoading,
  testID,
}) => {
  const { colors } = useTheme();
  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.root, { backgroundColor: colors.background }]}
      testID={testID}
    >
      <Rise style={styles.appBar}>
        {header ?? (
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: colors.text }]}
          >
            {title}
          </Text>
        )}
      </Rise>
      {isLoading ? (
        <Loader />
      ) : (
      <ScrollView
        contentContainerStyle={[styles.content, { gap }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {blocks.map((block, i) => (
          <Rise key={block.key ?? i} delay={(i + 1) * MOTION.stagger}>
            {block}
          </Rise>
        ))}
        <View style={styles.bottomSpace} />
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  appBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  title: { fontFamily: FONTS.bold, fontSize: 22, lineHeight: 30.8 },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  bottomSpace: { height: 4 },
});
