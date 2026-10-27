import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ChevronDown from '@/assets/figma/chevron-down.svg';
import SearchIcon from '@/assets/figma/search.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';
import type { Option } from '@/types';

import { BottomSheet } from './BottomSheet';
import { PrimaryButton } from './primitives';

type SelectSheetFieldProps = {
  label: string;
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  /** Keeps the sheet open so several options can be picked. */
  multiple?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  /** `compact` matches the shift form fields; `filled` matches IconField. */
  variant?: 'filled' | 'compact';
  testID?: string;
};

/** Input-styled dropdown whose options open in a searchable bottom sheet. */
export const SelectSheetField: FC<SelectSheetFieldProps> = ({
  label,
  options,
  selected,
  onToggle,
  multiple = false,
  placeholder,
  searchPlaceholder,
  hint,
  error,
  disabled = false,
  variant = 'filled',
  testID,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const compact = variant === 'compact';
  const summary = options
    .filter(option => selected.includes(option.id))
    .map(option => option.label)
    .join(', ');
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? options.filter(option => option.label.toLowerCase().includes(needle))
    : options;

  const close = () => {
    setIsOpen(false);
    setQuery('');
  };

  return (
    <View style={compact ? styles.fieldCompact : styles.field}>
      <Text
        style={[
          compact ? styles.labelCompact : styles.label,
          { color: compact ? colors.textSubtle : colors.textMuted },
        ]}
      >
        {label}
      </Text>
      {hint ? (
        <Text style={[styles.hint, { color: colors.textSubtle }]}>{hint}</Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: summary || placeholder || t('common.choose') }}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => setIsOpen(true)}
        style={[
          compact ? styles.boxCompact : styles.box,
          {
            backgroundColor: compact ? colors.surface : colors.fill,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
        testID={testID}
      >
        <Text
          numberOfLines={compact ? 1 : 2}
          style={[
            compact ? styles.valueCompact : styles.value,
            { color: summary ? colors.text : colors.textSubtle },
          ]}
        >
          {summary || placeholder || t('common.choose')}
        </Text>
        <ChevronDown width={16} height={16} color={colors.textMuted} />
      </Pressable>
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}
      {isOpen ? (
        <BottomSheet
          title={label}
          closeLabel={t('common.close')}
          onClose={close}
          testID={testID ? `${testID}-sheet` : undefined}
        >
          <View
            style={[
              styles.search,
              { backgroundColor: colors.fill, borderColor: colors.border },
            ]}
          >
            <SearchIcon width={18} height={18} color={colors.textMuted} />
            <TextInput
              accessibilityLabel={searchPlaceholder ?? t('common.search')}
              value={query}
              onChangeText={setQuery}
              placeholder={searchPlaceholder ?? t('common.search')}
              placeholderTextColor={colors.textSubtle}
              returnKeyType="search"
              autoCorrect={false}
              style={[styles.searchInput, { color: colors.text }]}
              testID={testID ? `${testID}-search` : undefined}
            />
          </View>
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
            {visible.map(option => {
              const isSelected = selected.includes(option.id);
              return (
                <Pressable
                  key={option.id}
                  accessibilityRole={multiple ? 'checkbox' : 'radio'}
                  accessibilityState={
                    multiple ? { checked: isSelected } : { selected: isSelected }
                  }
                  onPress={() => {
                    onToggle(option.id);
                    if (!multiple) close();
                  }}
                  style={[styles.option, { borderBottomColor: colors.border }]}
                  testID={testID ? `${testID}-${option.id}` : `chip-${option.id}`}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      { color: isSelected ? colors.primary : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected ? (
                    <Text style={[styles.optionLabel, { color: colors.primary }]}>
                      ✓
                    </Text>
                  ) : null}
                </Pressable>
              );
            })}
            {visible.length === 0 ? (
              <Text style={[styles.empty, { color: colors.textMuted }]}>
                {t('common.noMatches')}
              </Text>
            ) : null}
          </ScrollView>
          {multiple ? (
            <PrimaryButton label={t('common.done')} onPress={close} />
          ) : null}
        </BottomSheet>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { width: '100%', gap: 7 },
  fieldCompact: { gap: 6 },
  label: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  labelCompact: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
  hint: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 15.4 },
  box: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  boxCompact: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: { flex: 1, fontFamily: FONTS.regular, fontSize: 15, lineHeight: 21 },
  valueCompact: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  error: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  search: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
  list: { maxHeight: 420 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionLabel: { fontFamily: FONTS.semiBold, fontSize: 15 },
  empty: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    lineHeight: 18,
    paddingVertical: 14,
  },
});
