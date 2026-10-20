import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ChevronLeft from '@/assets/figma/chevron-left.svg';
import ChevronRight from '@/assets/figma/chevron-right.svg';
import { FONTS } from '@/constants/fonts';
import { useTheme } from '@/theme/ThemeProvider';

import { parseLocalDate, toLocalDateString } from '../utils';

type BusinessShiftCalendarProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

export const BusinessShiftCalendar: FC<BusinessShiftCalendarProps> = ({
  value,
  onChange,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const firstSelectedDate = parseLocalDate(
    value[0] ?? toLocalDateString(new Date()),
  );
  const [month, setMonth] = useState(
    () =>
      new Date(
        firstSelectedDate.getFullYear(),
        firstSelectedDate.getMonth(),
        1,
      ),
  );

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const cells = Array.from(
    { length: Math.ceil((mondayOffset + daysInMonth) / 7) * 7 },
    (_, index) => {
      const day = index - mondayOffset + 1;
      return day > 0 && day <= daysInMonth ? day : null;
    },
  );
  const weekdays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(2024, 0, 1 + index);
    return new Intl.DateTimeFormat(i18n.language, {
      weekday: 'short',
    }).format(date);
  });
  const monthLabel = new Intl.DateTimeFormat(i18n.language, {
    month: 'long',
    year: 'numeric',
  }).format(month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const changeMonth = (amount: number) => {
    setMonth(
      current =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.fill }]}>
      <View style={styles.monthRow}>
        <Text style={[styles.month, { color: colors.text }]}>{monthLabel}</Text>
        <View style={styles.monthActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('businessShiftCreate.previousMonth')}
            hitSlop={8}
            onPress={() => changeMonth(-1)}
            style={styles.monthButton}
          >
            <ChevronLeft width={16} height={16} color={colors.textSubtle} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('businessShiftCreate.nextMonth')}
            hitSlop={8}
            onPress={() => changeMonth(1)}
            style={styles.monthButton}
          >
            <ChevronRight width={16} height={16} color={colors.textSubtle} />
          </Pressable>
        </View>
      </View>
      <View style={styles.grid}>
        {weekdays.map((day, index) => (
          <Text
            key={`${day}-${index}`}
            style={[styles.weekday, { color: colors.textSubtle }]}
          >
            {day}
          </Text>
        ))}
        {cells.map((day, index) => {
          if (day === null) {
            return <View key={`blank-${index}`} style={styles.dayCell} />;
          }
          const date = new Date(month.getFullYear(), month.getMonth(), day);
          const dateString = toLocalDateString(date);
          const isSelected = value.includes(dateString);
          const isPast = date < today;
          return (
            <Pressable
              key={dateString}
              accessibilityRole="button"
              accessibilityLabel={new Intl.DateTimeFormat(i18n.language, {
                dateStyle: 'full',
              }).format(date)}
              accessibilityState={{ selected: isSelected, disabled: isPast }}
              disabled={isPast}
              onPress={() =>
                onChange(
                  isSelected
                    ? value.filter(selected => selected !== dateString)
                    : [...value, dateString].sort(),
                )
              }
              style={[
                styles.dayCell,
                isSelected && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.day,
                  {
                    color: isSelected
                      ? colors.onPrimary
                      : isPast
                      ? colors.textSubtle
                      : colors.text,
                  },
                ]}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 12, gap: 10 },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  month: { fontFamily: FONTS.semiBold, fontSize: 14 },
  monthActions: { flexDirection: 'row', gap: 12 },
  monthButton: { padding: 2 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 4,
  },
  weekday: {
    width: '13.5%',
    height: 22,
    textAlign: 'center',
    fontFamily: FONTS.regular,
    fontSize: 8,
  },
  dayCell: {
    width: '13.5%',
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: { fontFamily: FONTS.regular, fontSize: 10 },
});
