import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import XIcon from '@/assets/figma/x.svg';
import { FONTS } from '@/constants/fonts';
import { BOOKED_WORKERS_STRINGS } from '@/pages/businessApplicants/constants/bookedWorkersStrings';
import { LIVE_TEXT } from '@/services/liveWork/liveWorkStrings';
import type {
  ApiShiftStatus,
  BusinessShiftItem,
} from '@/services/shifts/shiftsApi';
import { useTheme } from '@/theme/ThemeProvider';
import { formatRupees } from '@/utils/format';

const CANCELLABLE: ApiShiftStatus[] = [
  'awaiting_payment',
  'draft',
  'searching',
  'open',
  'filled',
];

const STATUS_KEYS: Record<ApiShiftStatus, string> = {
  awaiting_payment: '',
  draft: 'businessDashboard.shiftStatus.draft',
  searching: 'businessDashboard.shiftStatus.searching',
  open: 'businessDashboard.shiftStatus.open',
  filled: 'businessDashboard.shiftStatus.filled',
  in_progress: 'businessDashboard.shiftStatus.inProgress',
  completed: 'businessDashboard.shiftStatus.completed',
  expired: 'businessDashboard.shiftStatus.expired',
  cancelled: 'businessDashboard.shiftStatus.cancelled',
};

const money = (minor: number) => formatRupees(Math.round(minor / 100));

type BusinessOwnedShiftCardProps = {
  shift: BusinessShiftItem;
  titleColor: string;
  isPaying: boolean;
  isPublishing: boolean;
  error: string;
  onCancel: () => void;
  onPay: () => void;
  onPublish: () => void;
  onOpenBooked: () => void;
  onOpenWithdrawn: () => void;
  onOpenLive: () => void;
  /** Cancel / post / pay buttons; the dashboard preview leaves them out (as on web). */
  showActions?: boolean;
};

/** Shift card on the business Shifts tab; mirrors web `BusinessShiftCard`. */
export const BusinessOwnedShiftCard: FC<BusinessOwnedShiftCardProps> = ({
  shift,
  titleColor,
  isPaying,
  isPublishing,
  error,
  onCancel,
  onPay,
  onPublish,
  onOpenBooked,
  onOpenWithdrawn,
  onOpenLive,
  showActions = true,
}) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const locale = i18n.language;

  const statusLabel =
    shift.status === 'awaiting_payment'
      ? t('businessShiftCreate.depositPending')
      : shift.shift_type === 'scheduled' && shift.status === 'open'
      ? t('businessDashboard.scheduledStatus')
      : shift.shift_type === 'live' && shift.status === 'searching'
      ? t('businessDashboard.searchingStatus')
      : t(STATUS_KEYS[shift.status]);
  const pill =
    shift.status === 'completed' || shift.status === 'filled'
      ? { color: colors.success, backgroundColor: colors.successSoft }
      : shift.status === 'cancelled' || shift.status === 'expired'
      ? { color: colors.textMuted, backgroundColor: colors.fill }
      : { color: colors.primary, backgroundColor: colors.primarySoft };

  const start = new Date(shift.starts_at);
  const end = new Date(shift.ends_at);
  const date = new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(start);
  const time = (value: Date) =>
    new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(value);
  const hours = Math.max(
    0,
    Number(((end.getTime() - start.getTime()) / 3_600_000).toFixed(1)),
  );
  const location = [shift.workplace_name, shift.address_text]
    .filter(Boolean)
    .join(' · ');

  const canCancel =
    CANCELLABLE.includes(shift.status) && shift.checked_in_count === 0;
  const beforeCutoff =
    shift.shift_type === 'scheduled' ||
    Date.now() < start.getTime() - shift.cancellation_cutoff_hours * 3_600_000;
  const needsDeposit =
    shift.status === 'awaiting_payment' && Boolean(shift.deposit_invoice_id);
  const isDraft = shift.status === 'draft';
  const isLive = shift.shift_type === 'live';
  const isTask = shift.pricing_mode === 'task';
  const hasActions =
    showActions && !isLive && (canCancel || isDraft || needsDeposit);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.row}>
        <Text
          style={[
            styles.pill,
            { color: pill.color, backgroundColor: pill.backgroundColor },
          ]}
        >
          {statusLabel}
        </Text>
        <Text style={[styles.topline, { color: colors.textMuted }]}>
          {shift.category_name}
        </Text>
      </View>
      <Text style={[styles.title, { color: titleColor }]}>
        {shift.job_title}
      </Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>
        {isTask
          ? `${date} · ${t('taskPricing.startsAt', { time: time(start) })}`
          : t('businessDashboard.dateTimeHours', {
              date,
              time: `${time(start)}–${time(end)}`,
              hours,
            })}
      </Text>
      {location ? (
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {location}
        </Text>
      ) : null}
      <View style={[styles.row, styles.footer]}>
        {isTask ? (
          <Text style={[styles.rate, { color: colors.text }]}>
            {t('taskPricing.fixedPriceAmount', {
              amount: money(shift.task_price_minor ?? 0),
            })}
          </Text>
        ) : (
          <Text style={[styles.rate, { color: colors.text }]}>
            {money(shift.hourly_rate_minor)}
            <Text style={[styles.perHour, { color: colors.textMuted }]}>
              {` ${t('businessDashboard.perHour')}`}
            </Text>
          </Text>
        )}
        <View style={styles.counts}>
          <Pressable
            accessibilityRole="button"
            disabled={shift.booked_count === 0}
            hitSlop={8}
            onPress={onOpenBooked}
          >
            <Text style={[styles.booked, { color: colors.primary }]}>
              {`${shift.booked_count}/${shift.workers_required} booked`}
            </Text>
          </Pressable>
          {shift.withdrawn_count ? (
            <Pressable
              accessibilityRole="button"
              hitSlop={8}
              onPress={onOpenWithdrawn}
            >
              <Text style={[styles.withdrawn, { color: colors.danger }]}>
                {BOOKED_WORKERS_STRINGS.withdrewCount(shift.withdrawn_count)}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {isLive ? (
        <Pressable
          accessibilityRole="button"
          onPress={onOpenLive}
          style={[styles.openLive, { borderColor: colors.primary }]}
          testID={`business-shift-open-live-${shift.id}`}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>
            {LIVE_TEXT.openLiveWork}
          </Text>
        </Pressable>
      ) : (
        <>
          <View style={[styles.row, styles.commission]}>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {t('businessShifts.commission', {
                rate: Number(shift.estimate.fee_percentage.toFixed(2)),
              })}
            </Text>
            <Text style={[styles.commissionValue, { color: colors.text }]}>
              {money(shift.estimate.platform_fee_minor)}
            </Text>
          </View>
          <View style={[styles.row, styles.total]}>
            <Text style={[styles.totalText, { color: colors.text }]}>
              {t('businessShifts.totalPayable')}
            </Text>
            <Text style={[styles.totalText, { color: colors.text }]}>
              {money(shift.estimate.total_minor)}
            </Text>
          </View>
        </>
      )}
      {hasActions ? (
        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          {needsDeposit ? (
            <Pressable
              accessibilityRole="button"
              disabled={isPaying}
              onPress={onPay}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                {isPaying
                  ? t('businessShifts.paying')
                  : t('businessShifts.payDepositAmount', {
                      amount: money(shift.estimate.total_minor),
                    })}
              </Text>
            </Pressable>
          ) : null}
          {isDraft ? (
            <Pressable
              accessibilityRole="button"
              disabled={isPublishing}
              onPress={onPublish}
              style={[styles.button, { backgroundColor: colors.primary }]}
            >
              {isPublishing ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : null}
              <Text style={[styles.buttonText, { color: colors.onPrimary }]}>
                {isPublishing
                  ? t('businessShifts.posting')
                  : t('businessShifts.postShift')}
              </Text>
            </Pressable>
          ) : null}
          {canCancel ? (
            <Pressable
              accessibilityRole="button"
              disabled={!beforeCutoff}
              onPress={onCancel}
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: beforeCutoff ? colors.danger : colors.border },
              ]}
            >
              <XIcon
                width={16}
                height={16}
                color={beforeCutoff ? colors.danger : colors.textMuted}
              />
              <Text
                style={[
                  styles.buttonText,
                  { color: beforeCutoff ? colors.danger : colors.textMuted },
                ]}
              >
                {t('businessShifts.cancelShift')}
              </Text>
            </Pressable>
          ) : null}
          {canCancel && !beforeCutoff ? (
            <Text style={[styles.note, { color: colors.textMuted }]}>
              {t('businessShifts.cancelCutoffPassed', {
                hours: shift.cancellation_cutoff_hours,
              })}
            </Text>
          ) : null}
          {error ? (
            <Text
              accessibilityRole="alert"
              style={[styles.error, { color: colors.danger }]}
            >
              {error}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  pill: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    lineHeight: 16,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  topline: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 16 },
  title: { fontFamily: FONTS.semiBold, fontSize: 18, lineHeight: 24 },
  meta: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 19.5 },
  footer: { alignItems: 'flex-end', marginTop: 4 },
  rate: { fontFamily: FONTS.bold, fontSize: 20, lineHeight: 26 },
  perHour: { fontFamily: FONTS.semiBold, fontSize: 13 },
  booked: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 20 },
  counts: { alignItems: 'flex-end', gap: 2 },
  withdrawn: { fontFamily: FONTS.semiBold, fontSize: 12, lineHeight: 16 },
  commission: { marginTop: -4 },
  commissionValue: {
    fontFamily: FONTS.semiBold,
    fontSize: 13,
    lineHeight: 19.5,
  },
  total: { marginTop: -8 },
  totalText: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 20 },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    rowGap: 8,
    columnGap: 16,
    marginTop: 4,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  button: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  cancelButton: { borderWidth: 1 },
  openLive: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  buttonText: { fontFamily: FONTS.semiBold, fontSize: 14, lineHeight: 20 },
  note: {
    flexBasis: '100%',
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  error: {
    flexBasis: '100%',
    fontFamily: FONTS.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
