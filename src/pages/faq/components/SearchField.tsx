import type { FC } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import SearchIcon from '@/assets/figma/search.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

type SearchFieldProps = {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
};

/** Figma FAQ search: 46px filled box with a leading search icon. */
export const SearchField: FC<SearchFieldProps> = ({
  value,
  placeholder,
  onChangeText,
}) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.box,
        { backgroundColor: colors.fill, borderColor: colors.border },
      ]}
    >
      <SearchIcon width={18} height={18} color={colors.textMuted} />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        returnKeyType="search"
        autoCorrect={false}
        style={[styles.input, { color: colors.text }]}
        testID="faq-search"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
});
