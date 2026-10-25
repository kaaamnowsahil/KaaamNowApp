import type { FC } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ChevronDown from '@/assets/figma/chevron-down.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import type { FaqItem } from '@/services/content/contentApi';

type FaqAccordionProps = {
  items: FaqItem[];
  openId: string | null;
  onToggle: (id: string) => void;
};

/** Figma FAQ card: filled, bordered list; one question expanded at a time. */
export const FaqAccordion: FC<FaqAccordionProps> = ({
  items,
  openId,
  onToggle,
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.fill, borderColor: colors.border },
      ]}
    >
      {items.map((item, index) => {
        const isOpen = item.id === openId;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ expanded: isOpen }}
            onPress={() => onToggle(item.id)}
            testID={`faq-${item.id}`}
            style={[
              styles.item,
              index < items.length - 1 && [
                styles.divider,
                { borderBottomColor: colors.border },
              ],
            ]}
          >
            <View style={styles.questionRow}>
              <Text style={[styles.question, { color: colors.text }]}>
                {item.question}
              </Text>
              <ChevronDown
                width={16}
                height={16}
                color={colors.textMuted}
                style={isOpen ? styles.chevronUp : undefined}
              />
            </View>
            {isOpen ? (
              <Text style={[styles.answer, { color: colors.textMuted }]}>
                {item.answer}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, overflow: 'hidden' },
  item: { paddingHorizontal: 16, paddingVertical: 16, gap: 6 },
  divider: { borderBottomWidth: 1 },
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  question: {
    flex: 1,
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 20,
  },
  chevronUp: { transform: [{ rotate: '180deg' }] },
  answer: { fontFamily: FONTS.regular, fontSize: 11.5, lineHeight: 18 },
});
