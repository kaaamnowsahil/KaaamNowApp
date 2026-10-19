import { useState, type FC } from 'react';
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

import { WORKER_HOME_STRINGS as S } from '../constants';
import { DEFAULT_FILTERS, type ShiftFilters } from '../hooks/useWorkerHome';
import {
  ANY_ID,
  BUSINESS_TYPE_OPTIONS,
  DISTANCE_OPTIONS,
  LENGTH_OPTIONS,
  PAY_OPTIONS,
} from '../mock';

/**
 * Bottom sheet behind the Discover filter button. No Figma frame; uses the
 * sign-up chips, Screen introduction and Screen actions styles.
 * Edits a draft and only commits on "Show shifts". Mount it only while open.
 */
export const FilterSheet: FC<{
  initial: ShiftFilters;
  onApply: (filters: ShiftFilters) => void;
  onClose: () => void;
}> = ({ initial, onApply, onClose }) => {
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
          ? draft.businessTypeIds.filter(t => t !== id)
          : [...draft.businessTypeIds, id],
    );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={S.CLOSE}
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
            <ScreenIntro title={S.FILTER_TITLE} subtitle={S.FILTER_SUBTITLE} />
            <ChipGroup
              label={S.FILTER_BUSINESS_TYPE}
              hint={S.FILTER_BUSINESS_TYPE_HINT}
              options={BUSINESS_TYPE_OPTIONS}
              selected={
                draft.businessTypeIds.length ? draft.businessTypeIds : [ANY_ID]
              }
              onToggle={toggleBusinessType}
            />
            <ChipGroup
              label={S.FILTER_DISTANCE}
              options={DISTANCE_OPTIONS}
              selected={[draft.distanceId]}
              onToggle={id => set('distanceId', id)}
            />
            <ChipGroup
              label={S.FILTER_PAY}
              options={PAY_OPTIONS}
              selected={[draft.payId]}
              onToggle={id => set('payId', id)}
            />
            <ChipGroup
              label={S.FILTER_LENGTH}
              options={LENGTH_OPTIONS}
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
                  {S.FILTER_VERIFIED}
                </Text>
                <Text style={[styles.switchHint, { color: colors.textSubtle }]}>
                  {S.FILTER_VERIFIED_HINT}
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
                label={S.FILTER_RESET}
                onPress={() => setDraft(DEFAULT_FILTERS)}
                testID="filter-reset"
              />
            </View>
            <View style={styles.action}>
              <PrimaryButton
                label={S.FILTER_APPLY}
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
  switchTitle: { fontFamily: FONTS.semiBold, fontSize: 15, lineHeight: 21 },
  switchHint: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16.8 },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  action: { flex: 1 },
});
