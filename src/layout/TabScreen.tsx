import { useRef, type FC, type ReactElement, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Loader, Rise } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { MOTION } from '@/constants/motion';
import { useTheme } from '@/theme/ThemeProvider';

import { useKeyboardInset } from './useKeyboardInset';

type TabScreenProps = {
  /** Plain 22px bold app-bar title; ignored when `header` is given. */
  title?: string;
  /** Custom app-bar content, e.g. the brand bar on Discover. */
  header?: ReactNode;
  /** Each block rises in on mount, staggered. Give every block a key. */
  blocks: ReactElement[];
  /** Lets the final content block fill and align within the available screen height. */
  fillLastBlock?: boolean;
  /** Space between blocks; Discover uses 8, Profile 10. */
  gap?: number;
  /** Shows the brand loader instead of the blocks. */
  isLoading?: boolean;
  /** Shows the brand loader over the blocks while an action runs. */
  busy?: boolean;
  /** Bar pinned above the tab bar with a top border ("Screen actions"). */
  actions?: ReactNode;
  testID?: string;
};

/**
 * Bottom-tab screen frame from Figma Discover (1:1456): 56px app bar and a
 * scrollable "Screen content" (12 top, 32 bottom without a footer, 20 horizontal, 8 gap).
 */
export const TabScreen: FC<TabScreenProps> = ({
  title,
  header,
  blocks,
  fillLastBlock,
  gap = 8,
  isLoading,
  busy,
  actions,
  testID,
}) => {
  const { colors } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  useKeyboardInset(scrollRef);
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
      <View style={styles.root}>
      {isLoading ? null : (
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: actions ? 20 : 32 },
          fillLastBlock && styles.fillContent,
          { gap },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {blocks.map((block, i) => (
          <Rise
            key={`${block.key ?? 'block'}-${i}`}
            delay={(i + 1) * MOTION.stagger}
            style={fillLastBlock && i === blocks.length - 1 ? styles.fillBlock : undefined}
          >
            {block}
          </Rise>
        ))}
      </ScrollView>
      )}
      {actions && !isLoading ? (
        <View
          style={[
            styles.actions,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
            },
          ]}
        >
          {actions}
        </View>
      ) : null}
      </View>
      {isLoading || busy ? <Loader /> : null}
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
  content: { paddingHorizontal: 20, paddingTop: 12 },
  fillContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  fillBlock: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  actions: {
    borderTopWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 10,
  },
});
