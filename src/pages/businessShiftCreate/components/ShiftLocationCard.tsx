import { useState, type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import MapPinIcon from '@/assets/figma/map-pin.svg';
import { FONTS } from '@/constants/fonts';
import { useCurrentAddress } from '@/shared/hooks/useCurrentAddress';
import { useTheme } from '@/theme/ThemeProvider';
import type { PickedAddress } from '@/types';

import { ShiftFormField } from './ShiftFormField';
import { ShiftLocationMap } from './ShiftLocationMap';

type ShiftLocationCardProps = {
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  isGeocoding: boolean;
  onAddressChange: (address: string) => void;
  onPicked: (picked: PickedAddress) => void;
  onMapPick: (latitude: number, longitude: number) => void;
  error?: string;
};

const RefreshIcon: FC<{ color: string; size: number }> = ({ color, size }) => (
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
    <Path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <Path d="M21 3v5h-5" />
    <Path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <Path d="M8 16H3v5" />
  </Svg>
);

export const ShiftLocationCard: FC<ShiftLocationCardProps> = ({
  address,
  latitude,
  longitude,
  isGeocoding,
  onAddressChange,
  onPicked,
  onMapPick,
  error,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { locate, isLocating, locateError } = useCurrentAddress(onPicked);
  const [mapIsOpen, setMapIsOpen] = useState(false);
  const pin =
    latitude != null && longitude != null ? { latitude, longitude } : null;
  const isBusy = isLocating || isGeocoding;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: error ? colors.danger : colors.border,
        },
      ]}
      testID="business-shift-location"
    >
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('businessShiftCreate.confirmWorkLocation')}
          </Text>
          <Text style={[styles.note, { color: colors.textSubtle }]}>
            {t('businessShiftCreate.confirmWorkLocationHint')}
          </Text>
        </View>
        <MapPinIcon width={20} height={20} color={colors.primary} />
      </View>
      <ShiftFormField
        label={t('businessLiveCreate.location')}
        value={address}
        onChangeText={onAddressChange}
        placeholder={t('businessLiveCreate.locationPlaceholder')}
        testID="business-shift-location-input"
      />
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={isBusy}
          onPress={locate}
          style={[
            styles.action,
            isBusy && styles.actionBusy,
            { borderColor: colors.border, backgroundColor: colors.background },
          ]}
          testID="business-shift-use-current-location"
        >
          <RefreshIcon size={16} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.primary }]}>
            {t('businessShiftCreate.useCurrentLocation')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: mapIsOpen }}
          onPress={() => setMapIsOpen(open => !open)}
          style={[
            styles.action,
            { borderColor: colors.border, backgroundColor: colors.background },
          ]}
          testID="business-shift-choose-on-map"
        >
          <MapPinIcon width={16} height={16} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.primary }]}>
            {t(
              mapIsOpen
                ? 'businessShiftCreate.hideMap'
                : 'businessShiftCreate.chooseOnMap',
            )}
          </Text>
        </Pressable>
      </View>
      {isBusy ? (
        <Text style={[styles.note, { color: colors.textSubtle }]}>
          {t('businessShiftCreate.findingLocation')}
        </Text>
      ) : null}
      {pin ? (
        <Text style={[styles.note, { color: colors.textSubtle }]}>
          {t('businessShiftCreate.locationCoordinates', {
            latitude: pin.latitude.toFixed(5),
            longitude: pin.longitude.toFixed(5),
          })}
        </Text>
      ) : null}
      {mapIsOpen ? (
        <View style={styles.mapBlock}>
          <ShiftLocationMap
            pin={pin}
            disabled={isBusy}
            onPick={next => onMapPick(next.latitude, next.longitude)}
          />
          <Text style={[styles.note, { color: colors.textSubtle }]}>
            {t('businessShiftCreate.tapMapToSetLocation')}
          </Text>
        </View>
      ) : null}
      {locateError || (error && !isBusy) ? (
        <Text style={[styles.note, { color: colors.danger }]}>
          {locateError || error}
        </Text>
      ) : !pin && !isBusy ? (
        <Text style={[styles.note, { color: colors.textSubtle }]}>
          {t('businessShiftCreate.locationNeedsPin')}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  heading: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  headingCopy: { flex: 1, gap: 4 },
  title: { fontFamily: FONTS.semiBold, fontSize: 16, lineHeight: 22 },
  note: { fontFamily: FONTS.regular, fontSize: 12, lineHeight: 17 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 38,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  actionBusy: { opacity: 0.6 },
  actionLabel: { fontFamily: FONTS.semiBold, fontSize: 12 },
  mapBlock: { gap: 6 },
});
