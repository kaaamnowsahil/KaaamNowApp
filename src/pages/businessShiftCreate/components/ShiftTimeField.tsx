import { useRef, useState, type ComponentRef, type FC } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';

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

const ITEM_HEIGHT = 38;
const VISIBLE_ITEMS = 7;
const POPOVER_WIDTH = 190;
const HOURS = Array.from({ length: 12 }, (_, index) => index + 1);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);
const PERIODS: Period[] = ['AM', 'PM'];
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

const ClockIcon: FC<{ color: string }> = ({ color }) => (
  <Svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <Circle cx={12} cy={12} r={10} />
    <Polyline points="12 6 12 12 16 14" />
  </Svg>
);

/** Time input with a clock icon; opens an hour / minute / AM-PM picker under the field (same as web). */
export const ShiftTimeField: FC<ShiftTimeFieldProps> = ({
  label,
  value,
  placeholder,
  onChange,
  error,
  testID,
}) => {
  const { colors } = useTheme();
  const window = useWindowDimensions();
  const fieldRef = useRef<ComponentRef<typeof View>>(null);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const parts = toParts(value);
  const current: Parts = parts ?? { hour: 9, minute: 0, period: 'AM' };

  const open = () =>
    fieldRef.current?.measureInWindow((x, y, _width, height) => {
      const popoverHeight = ITEM_HEIGHT * VISIBLE_ITEMS + 8;
      const below = y + height + 4;
      setAnchor({
        top:
          below + popoverHeight > window.height
            ? Math.max(8, y - popoverHeight - 4)
            : below,
        left: Math.min(x, window.width - POPOVER_WIDTH - 8),
      });
    });

  const set = (changes: Partial<Parts>) => onChange(fromParts({ ...current, ...changes }));

  const renderColumn = <T extends number | Period>(
    items: T[],
    selected: T | undefined,
    format: (item: T) => string,
    onSelect: (item: T) => void,
    name: string,
  ) => {
    const index = selected === undefined ? 0 : Math.max(0, items.indexOf(selected));
    return (
      <ScrollView
        style={styles.column}
        contentOffset={{ x: 0, y: Math.max(0, index - 1) * ITEM_HEIGHT }}
        showsVerticalScrollIndicator={false}
      >
        {items.map(item => {
          const isSelected = item === selected;
          return (
            <Pressable
              key={String(item)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onSelect(item)}
              style={[
                styles.item,
                isSelected && { backgroundColor: colors.primary },
              ]}
              testID={testID ? `${testID}-${name}-${String(item)}` : undefined}
            >
              <Text
                style={[
                  styles.itemLabel,
                  { color: isSelected ? colors.onPrimary : colors.text },
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

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.textSubtle }]}>{label}</Text>
      <Pressable
        ref={fieldRef}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: parts ? fromDisplay(parts) : placeholder }}
        onPress={open}
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
          {parts ? fromDisplay(parts) : placeholder}
        </Text>
        <ClockIcon color={colors.text} />
      </Pressable>
      <ShiftFieldError message={error} />
      {anchor ? (
        <Modal
          transparent
          visible
          statusBarTranslucent
          animationType="none"
          onRequestClose={() => setAnchor(null)}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAnchor(null)} />
          <View
            style={[
              styles.popover,
              {
                top: anchor.top,
                left: anchor.left,
                backgroundColor: colors.background,
                borderColor: colors.border,
              },
            ]}
            testID={testID ? `${testID}-picker` : undefined}
          >
            {renderColumn(HOURS, parts?.hour, pad, hour => set({ hour }), 'hour')}
            {renderColumn(MINUTES, parts?.minute, pad, minute => set({ minute }), 'minute')}
            {renderColumn(PERIODS, parts?.period, p => p, period => set({ period }), 'period')}
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

const fromDisplay = ({ hour, minute, period }: Parts) => `${pad(hour)}:${pad(minute)} ${period}`;

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
  popover: {
    position: 'absolute',
    width: POPOVER_WIDTH,
    height: ITEM_HEIGHT * VISIBLE_ITEMS + 8,
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderWidth: 1,
    borderRadius: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  column: { flex: 1 },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  itemLabel: { fontFamily: FONTS.semiBold, fontSize: 15 },
});
