import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChipGroup,
  PrimaryButton,
  ScreenIntro,
  SecondaryButton,
} from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { DEFAULT_FILTERS, type ShiftFilters } from '../hooks/useWorkerHome';
import type { Option } from '@/types';

import {
  ANY_ID,
  DISTANCE_OPTIONS,
  LENGTH_OPTIONS,
  PAY_OPTIONS,
} from '../constants/filterOptions';

/**
 * Bottom sheet behind the Discover filter button. No Figma frame; uses the
 * sign-up chips, Screen introduction and Screen actions styles.
 * Edits a draft and only commits on "Show shifts". Mount it only while open.
 */
export const FilterSheet: FC<{
  initial: ShiftFilters;
  businessTypes: Option[];
  onApply: (filters: ShiftFilters) => void;
  onClose: () => void;
}> = ({ initial, businessTypes, onApply, onClose }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(initial);

  const set = <K extends keyof ShiftFilters>(key: K, value: ShiftFilters[K]) =>
    setDraft(prev => ({ ...prev, [key]: value }));

  const toggleBusinessType = (id: string) =>
    set(
      'businessTypeIds',
      id === ANY_ID
        ? []
        : draft.businessTypeIds.includes(id)
          ? draft.businessTypeIds.filter(typeId => typeId !== id)
          : [...draft.businessTypeIds, id],
    );

  const businessTypeOptions = [
    { id: ANY_ID, label: t('shiftFilters.any') },
    ...businessTypes,
  ];
  const distanceOptions = DISTANCE_OPTIONS.map(option => ({
    ...option,
    label:
      option.id === ANY_ID
        ? t('shiftFilters.any')
        : t('shiftFilters.within', { distance: option.max }),
  }));
  const payOptions = PAY_OPTIONS.map(option => ({
    ...option,
    label:
      option.id === ANY_ID
        ? t('shiftFilters.any')
        : t('shiftFilters.payThreshold', { amount: option.min }),
  }));
  const lengthOptions = LENGTH_OPTIONS.map(option => ({
    ...option,
    label:
      option.id === ANY_ID
        ? t('shiftFilters.any')
        : option.id === 'short'
          ? t('shiftFilters.upToHours', { hours: option.max })
          : option.id === 'half'
            ? t('shiftFilters.fromToHours', {
              from: option.min,
              to: option.max,
            })
            : t('shiftFilters.atLeastHours', { hours: option.min }),
  }));

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('shiftFilters.close')}
          onPress={onClose}
          style={[styles.backdrop, { backgroundColor: colors.backdrop }]}
        />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          testID="filter-sheet"
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <ScrollView contentContainerStyle={styles.content}>
            <ScreenIntro
              title={t('shiftFilters.title')}
              subtitle={t('shiftFilters.subtitle')}
            />
            <ChipGroup
              label={t('shiftFilters.businessType')}
              hint={t('shiftFilters.businessTypeHint')}
              options={businessTypeOptions}
              selected={
                draft.businessTypeIds.length ? draft.businessTypeIds : [ANY_ID]
              }
              onToggle={toggleBusinessType}
            />
            <ChipGroup
              label={t('shiftFilters.distance')}
              options={distanceOptions}
              selected={[draft.distanceId]}
              onToggle={id => set('distanceId', id)}
            />
            <ChipGroup
              label={t('shiftFilters.minimumPay')}
              options={payOptions}
              selected={[draft.payId]}
              onToggle={id => set('payId', id)}
            />
            <ChipGroup
              label={t('shiftFilters.length')}
              options={lengthOptions}
              selected={[draft.lengthId]}
              onToggle={id => set('lengthId', id)}
            />
            <View
              style={[
                styles.switchRow,
                { backgroundColor: colors.fill, borderColor: colors.border },
              ]}
            >
              <View style={styles.switchText}>
                <Text style={[styles.switchTitle, { color: colors.text }]}>
                  {t('shiftFilters.verified')}
                </Text>
                <Text style={[styles.switchHint, { color: colors.textSubtle }]}>
                  {t('shiftFilters.verifiedHint')}
                </Text>
              </View>
              <Switch
                value={draft.verifiedOnly}
                onValueChange={v => set('verifiedOnly', v)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.onPrimary}
                ios_backgroundColor={colors.border}
                testID="filter-verified"
              />
            </View>
          </ScrollView>
          <View
            style={[
              styles.actions,
              {
                borderTopColor: colors.border,
                paddingBottom: 24 + insets.bottom,
              },
            ]}
          >
            <View style={styles.action}>
              <SecondaryButton
                label={t('shiftFilters.reset')}
                onPress={() => setDraft(DEFAULT_FILTERS)}
                testID="filter-reset"
              />
            </View>
            <View style={styles.action}>
              <PrimaryButton
                label={t('shiftFilters.apply')}
                onPress={() => onApply(draft)}
                testID="filter-apply"
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
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
  },
  content: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 20 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
  },
  switchText: { flex: 1, gap: 2 },
  switchTitle: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 22 },
  switchHint: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 18 },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  action: { flex: 1 },
});
