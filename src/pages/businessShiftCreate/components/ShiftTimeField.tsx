import { useRef, useState, type ComponentRef, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { ShiftFieldError } from './ShiftFieldError';

type ShiftTimeFieldProps = {
  label: string;
  /** 24h "HH:MM", or '' when not set. */
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  error?: string;
  testID?: string;
};

type Period = 'AM' | 'PM';
type Parts = { hour: number; minute: number; period: Period };

const ITEM_HEIGHT = 52;
const VISIBLE_ITEMS = 5;
const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const PERIODS: Period[] = ['AM', 'PM'];
const DEFAULT_PARTS: Parts = { hour: 9, minute: 0, period: 'AM' };
const pad = (value: number) => String(value).padStart(2, '0');

const toParts = (value: string): Parts | null => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  return {
    hour: hours % 12 === 0 ? 12 : hours % 12,
    minute: Number(match[2]),
    period: hours >= 12 ? 'PM' : 'AM',
  };
};

const fromParts = ({ hour, minute, period }: Parts) =>
  `${pad((hour % 12) + (period === 'PM' ? 12 : 0))}:${pad(minute)}`;

const display = ({ hour, minute, period }: Parts) => `${pad(hour)}:${pad(minute)} ${period}`;

const Icon: FC<{ color: string; size?: number; kind: 'clock' | 'close' | 'check' }> = ({
  color,
  size = 16,
  kind,
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {kind === 'clock' ? (
      <>
        <Circle cx={12} cy={12} r={10} />
        <Polyline points="12 6 12 12 16 14" />
      </>
    ) : kind === 'close' ? (
      <Path d="M18 6 6 18M6 6l12 12" />
    ) : (
      <Path d="M20 6 9 17l-5-5" />
    )}
  </Svg>
);

type WheelProps<T extends number | string> = {
  items: T[];
  value: T;
  format: (item: T) => string;
  onChange: (item: T) => void;
  testID?: string;
};

/** Snapping column; the row in the centre band is the selected value. */
const Wheel = <T extends number | string>({
  items,
  value,
  format,
  onChange,
  testID,
}: WheelProps<T>) => {
  const { colors } = useTheme();
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  const [initialIndex] = useState(() => Math.max(0, items.indexOf(value)));
  const index = Math.max(0, items.indexOf(value));

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.min(
      items.length - 1,
      Math.max(0, Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT)),
    );
    const item = items[next];
    if (item !== undefined && item !== value) onChange(item);
  };

  return (
    <ScrollView
      ref={ref}
      style={styles.column}
      contentContainerStyle={styles.columnContent}
      contentOffset={{ x: 0, y: initialIndex * ITEM_HEIGHT }}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      testID={testID}
    >
      {items.map((item, i) => {
        const distance = Math.abs(i - index);
        return (
          <Pressable
            key={String(item)}
            accessibilityRole="button"
            accessibilityState={{ selected: distance === 0 }}
            onPress={() => ref.current?.scrollTo({ y: i * ITEM_HEIGHT, animated: true })}
            style={styles.item}
            testID={testID ? `${testID}-${String(item)}` : undefined}
          >
            <Text
              style={[
                styles.itemLabel,
                distance === 0
                  ? [styles.itemSelected, { color: colors.text }]
                  : distance === 1
                    ? [styles.itemNear, { color: colors.textMuted }]
                    : { color: colors.textSubtle },
              ]}
            >
              {format(item)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

/** Time input with a clock icon; opens an AM-PM / hour / minute scroll wheel in a bottom sheet (same as web). */
export const ShiftTimeField: FC<ShiftTimeFieldProps> = ({
  label,
  value,
  placeholder,
  onChange,
  error,
  testID,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const parts = toParts(value);
  const [draft, setDraft] = useState<Parts | null>(null);

  const close = () => setDraft(null);
  const confirm = () => {
    if (draft) onChange(fromParts(draft));
    close();
  };
  const set = (changes: Partial<Parts>) =>
    setDraft(current => ({ ...(current ?? DEFAULT_PARTS), ...changes }));

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSubtle }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: parts ? display(parts) : placeholder }}
        onPress={() => setDraft(parts ?? DEFAULT_PARTS)}
        style={[
          styles.inputBox,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
        testID={testID}
      >
        <Text
          numberOfLines={1}
          style={[styles.value, { color: parts ? colors.text : colors.textSubtle }]}
        >
          {parts ? display(parts) : placeholder}
        </Text>
        <Icon kind="clock" color={colors.text} />
      </Pressable>
      <ShiftFieldError message={error} />
      {draft ? (
        <Modal
          transparent
          visible
          statusBarTranslucent
          animationType="slide"
          onRequestClose={close}
        >
          <View style={styles.root}>
            <Pressable
              accessibilityLabel={t('common.cancel')}
              style={[StyleSheet.absoluteFill, { backgroundColor: colors.backdrop }]}
              onPress={close}
            />
            <View
              style={[
                styles.sheet,
                { backgroundColor: colors.background, paddingBottom: 24 + insets.bottom },
              ]}
              testID={testID ? `${testID}-picker` : undefined}
            >
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
              <View style={styles.header}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.cancel')}
                  hitSlop={8}
                  onPress={close}
                  style={styles.iconButton}
                  testID={testID ? `${testID}-cancel` : undefined}
                >
                  <Icon kind="close" size={24} color={colors.text} />
                </Pressable>
                <View style={styles.titleBlock}>
                  <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
                    {label}
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    {display(draft)}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.done')}
                  hitSlop={8}
                  onPress={confirm}
                  style={styles.iconButton}
                  testID={testID ? `${testID}-confirm` : undefined}
                >
                  <Icon kind="check" size={24} color={colors.primary} />
                </Pressable>
              </View>
              <View style={styles.columnLabels}>
                <Text style={styles.columnLabel} />
                <Text style={[styles.columnLabel, { color: colors.textMuted }]}>H</Text>
                <Text style={[styles.columnLabel, { color: colors.textMuted }]}>M</Text>
              </View>
              <View style={styles.wheel}>
                <View
                  pointerEvents="none"
                  style={[styles.band, { backgroundColor: colors.fill }]}
                />
                <Wheel
                  items={PERIODS}
                  value={draft.period}
                  format={period => period}
                  onChange={period => set({ period })}
                  testID={testID ? `${testID}-period` : undefined}
                />
                <Wheel
                  items={HOURS}
                  value={draft.hour}
                  format={pad}
                  onChange={hour => set({ hour })}
                  testID={testID ? `${testID}-hour` : undefined}
                />
                <Wheel
                  items={MINUTES}
                  value={draft.minute}
                  format={pad}
                  onChange={minute => set({ minute })}
                  testID={testID ? `${testID}-minute` : undefined}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
  inputBox: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: { flex: 1, fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },
  handle: { alignSelf: 'center', width: 32, height: 4, borderRadius: 2 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { flex: 1, alignItems: 'center' },
  title: { fontFamily: FONTS.semiBold, fontSize: 20, lineHeight: 26 },
  subtitle: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  columnLabels: { flexDirection: 'row' },
  columnLabel: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FONTS.semiBold,
    fontSize: 14,
  },
  wheel: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    flexDirection: 'row',
    marginBottom: 8,
  },
  band: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 12,
  },
  column: { flex: 1 },
  columnContent: { paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2) },
  item: { height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  itemLabel: { fontFamily: FONTS.regular, fontSize: 22 },
  itemNear: { fontSize: 26 },
  itemSelected: { fontFamily: FONTS.semiBold, fontSize: 34 },
});
