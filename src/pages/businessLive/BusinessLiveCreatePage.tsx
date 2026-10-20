import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import type { GeolocationError } from '@react-native-community/geolocation';

import { MapPreview } from '@/components/shiftFlow';
import { PrimaryButton, ScreenIntro, SecondaryButton } from '@/components/ui';
import { FONTS } from '@/constants/fonts';
import { ROUTES } from '@/constants/routes';
import { useBusinessLiveStore } from '@/services/business/useBusinessLiveStore';
import { useOnboardingStore } from '@/services/onboarding/useOnboardingStore';
import {
  geocodeAddress,
  isGoogleMapsConfigured,
  reverseGeocode,
} from '@/services/maps/googleMaps';
import { FormScreen } from '@/layout/FormScreen';
import { useTheme } from '@/theme/ThemeProvider';
import type { AppScreenProps, BusinessLiveRequestDraft } from '@/types';

import { ShiftFormField } from '../businessShiftCreate/components';
import { BUSINESS_DASHBOARD, createDefaultBusinessLiveDraft } from './mock';

export const BusinessLiveCreatePage: FC<
  AppScreenProps<typeof ROUTES.businessLiveCreate>
> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const savedDraft = useBusinessLiveStore(state => state.draft);
  const saveDraft = useBusinessLiveStore(state => state.saveDraft);
  const businessAddress = useOnboardingStore(state => state.business?.address);
  const [draft, setDraft] = useState(
    () =>
      savedDraft ??
      createDefaultBusinessLiveDraft(
        businessAddress || BUSINESS_DASHBOARD.location,
      ),
  );
  const [locationEdited, setLocationEdited] = useState(false);
  const [locationStatus, setLocationStatus] = useState<
    'locating' | 'located' | 'unavailable' | 'edited'
  >('locating');

  useEffect(() => {
    if (locationEdited) return;
    let isMounted = true;
    const applyPosition: Parameters<
      typeof Geolocation.getCurrentPosition
    >[0] = position => {
      if (!isMounted) return;
      const { latitude, longitude } = position.coords;
      const coordinates = { latitude, longitude };
      setDraft(current => ({
        ...current,
        location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        latitude,
        longitude,
      }));
      setLocationStatus('located');
      reverseGeocode(coordinates)
        .then(address => {
          if (address && isMounted) {
            setDraft(current => ({
              ...current,
              location: address,
              latitude,
              longitude,
            }));
          }
        })
        .catch(error => {
          if (isMounted) {
            console.error(
              'Failed to resolve the current workplace address.',
              error,
            );
          }
        });
    };
    const setLocationUnavailable = () => {
      if (isMounted) {
        setLocationStatus('unavailable');
      }
    };
    const onLocationError = (_error: GeolocationError) =>
      setLocationUnavailable();

    const getLocation = () =>
      Geolocation.getCurrentPosition(applyPosition, onLocationError, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      });
    const requestLocation = async () => {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocationUnavailable();
          return;
        }
        getLocation();
        return;
      }
      Geolocation.requestAuthorization(getLocation, onLocationError);
    };
    requestLocation().catch(error => {
      console.error('Failed to request live-work location permission.', error);
      setLocationUnavailable();
    });

    return () => {
      isMounted = false;
    };
  }, [locationEdited]);
  useEffect(() => {
    const address = draft.location.trim();
    if (!locationEdited || !address || !Number.isNaN(Number(address))) {
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      geocodeAddress(address, controller.signal)
        .then(coordinates => {
          if (coordinates) {
            setDraft(current => ({
              ...current,
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
            }));
          }
        })
        .catch(error => {
          if (!controller.signal.aborted) {
            console.error(
              'Failed to locate the edited workplace address.',
              error,
            );
          }
        });
    }, 700);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [draft.location, locationEdited]);
  const workers = Number(draft.workers) || 0;
  const hours = Number(draft.hours) || 0;
  const rate = Number(draft.hourlyRate) || 0;
  const subtotal = workers * hours * rate;
  const fee = Math.round(subtotal * 0.05);
  const total = subtotal + fee;
  const [startHour, startMinute] = draft.startTime.split(':').map(Number);
  const endMinutes =
    (startHour * 60 + startMinute + Number(draft.hours) * 60) % (24 * 60);
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(
    2,
    '0',
  )}:${String(endMinutes % 60).padStart(2, '0')}`;
  const dateLabel = new Intl.DateTimeFormat(i18n.language, {
    day: 'numeric',
    month: 'short',
  }).format(new Date());

  const update = (
    key: Exclude<keyof BusinessLiveRequestDraft, 'searchRadiusKm'>,
    value: string,
  ) => {
    if (key === 'location') {
      setLocationEdited(true);
      setLocationStatus('edited');
      setDraft(current => ({
        ...current,
        location: value,
        latitude: null,
        longitude: null,
      }));
      return;
    }
    setDraft(current => ({ ...current, [key]: value }));
  };

  const hasValidFields =
    draft.role.trim().length > 0 &&
    draft.location.trim().length > 0 &&
    draft.category.trim().length > 0 &&
    draft.responsibilities.trim().length > 0 &&
    draft.requirement.trim().length > 0 &&
    draft.workplaceInstructions.trim().length > 0 &&
    Number.isInteger(Number(draft.workers)) &&
    Number(draft.workers) > 0 &&
    Number.isFinite(Number(draft.hourlyRate)) &&
    Number(draft.hourlyRate) > 0 &&
    Number.isInteger(Number(draft.hours)) &&
    Number(draft.hours) > 0 &&
    Number(draft.hours) <= 24 &&
    /^\d{2}:\d{2}$/.test(draft.startTime) &&
    startHour < 24 &&
    startMinute < 60;

  const reviewRequest = () => {
    if (!hasValidFields) {
      Alert.alert(t('businessLiveCreate.invalidForm'));
      return;
    }
    saveDraft(draft);
    navigation.navigate(ROUTES.businessLiveReview);
  };

  const save = () => {
    saveDraft(draft);
    Alert.alert(
      t('businessLiveCreate.draftSavedTitle'),
      t('businessLiveCreate.draftSavedBody'),
    );
  };

  return (
    <FormScreen
      onBack={navigation.goBack}
      title={t('businessApplicants.headerTitle')}
      subtitle={t('businessDashboard.liveStatus')}
      headerTag={t('businessApplicants.headerTag')}
      gap={12}
      testID="business-live-create-page"
      actions={
        <>
          <PrimaryButton
            label={t('businessLiveCreate.reviewLocation')}
            onPress={reviewRequest}
            testID="business-live-find-workers"
          />
          <SecondaryButton
            label={t('businessLiveCreate.saveDraft')}
            onPress={save}
            testID="business-live-save-draft"
          />
        </>
      }
    >
      <View style={styles.heading}>
        <Text style={[styles.overline, { color: colors.primary }]}>
          {t('businessLiveCreate.liveOverline')}
        </Text>
        <ScreenIntro
          title={t('businessLiveCreate.title')}
          subtitle={t('businessLiveCreate.subtitle')}
        />
      </View>

      <ShiftFormField
        label={t('businessLiveCreate.role')}
        value={draft.role}
        onChangeText={value => update('role', value)}
        placeholder={t('businessLiveCreate.rolePlaceholder')}
        testID="business-live-role"
      />
      <ShiftFormField
        label={t('businessLiveCreate.category')}
        value={draft.category}
        onChangeText={value => update('category', value)}
        placeholder={t('businessLiveCreate.categoryPlaceholder')}
        testID="business-live-category"
      />
      <ShiftFormField
        label={t('businessLiveCreate.responsibilities')}
        value={draft.responsibilities}
        onChangeText={value => update('responsibilities', value)}
        multiline
        textAlignVertical="top"
        style={styles.multiline}
        testID="business-live-responsibilities"
      />
      <ShiftFormField
        label={t('businessLiveCreate.requirement')}
        value={draft.requirement}
        onChangeText={value => update('requirement', value)}
        testID="business-live-requirement"
      />
      <ShiftFormField
        label={t('businessLiveCreate.workers')}
        value={draft.workers}
        onChangeText={value => update('workers', value)}
        keyboardType="number-pad"
        testID="business-live-workers"
      />
      <ShiftFormField
        label={t('businessLiveCreate.hourlyRate')}
        value={draft.hourlyRate}
        onChangeText={value => update('hourlyRate', value)}
        keyboardType="decimal-pad"
        prefix="₹"
        testID="business-live-rate"
      />
      <View style={styles.row}>
        <ShiftFormField
          label={t('businessLiveCreate.startTime')}
          value={draft.startTime}
          onChangeText={value => update('startTime', value)}
          keyboardType="numbers-and-punctuation"
          placeholder="14:00"
          maxLength={5}
          testID="business-live-start-time"
        />
        <ShiftFormField
          label={t('businessLiveCreate.hours')}
          value={draft.hours}
          onChangeText={value => update('hours', value)}
          keyboardType="decimal-pad"
          testID="business-live-hours"
        />
      </View>
      <View style={styles.field}>
        <Text style={[styles.fieldLabel, { color: colors.textSubtle }]}>
          {t('businessLiveCreate.startAndDuration')}
        </Text>
        <View
          style={[
            styles.readOnlyField,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.readOnlyText, { color: colors.text }]}>
            {t('businessLiveCreate.dateTimeSummary', {
              date: t('businessLiveCreate.today'),
              day: dateLabel,
              start: draft.startTime,
              end: endTime,
              hours: draft.hours,
            })}
          </Text>
        </View>
      </View>
      <MapPreview
        variant="pin"
        label={draft.location}
        height={112}
        coordinates={
          draft.latitude !== null && draft.longitude !== null
            ? { latitude: draft.latitude, longitude: draft.longitude }
            : null
        }
      />
      <ShiftFormField
        label={t('businessLiveCreate.location')}
        value={draft.location}
        onChangeText={value => update('location', value)}
        placeholder={t('businessLiveCreate.locationPlaceholder')}
        testID="business-live-location"
      />
      <Text style={[styles.locationHint, { color: colors.textSubtle }]}>
        {t(
          !isGoogleMapsConfigured
            ? 'businessLiveCreate.mapsConfigurationMissing'
            : `businessLiveCreate.${
                {
                  locating: 'locationFetching',
                  located: 'locationSourceHint',
                  unavailable: 'locationUnavailable',
                  edited: 'locationEditedHint',
                }[locationStatus]
              }`,
        )}
      </Text>
      <ShiftFormField
        label={t('businessLiveCreate.workplaceInstructions')}
        value={draft.workplaceInstructions}
        onChangeText={value => update('workplaceInstructions', value)}
        placeholder={t('businessLiveCreate.workplaceInstructionsPlaceholder')}
        testID="business-live-instructions"
      />
      <View
        style={[
          styles.details,
          { backgroundColor: colors.fill, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.detailsText, { color: colors.textSubtle }]}>
          {t('businessLiveCreate.detailsPreview', {
            location: draft.location,
            radius: draft.searchRadiusKm,
            requirement: draft.requirement,
            instructions: draft.workplaceInstructions,
            workers,
            hours,
            rate: rate.toLocaleString('en-IN'),
            subtotal: subtotal.toLocaleString('en-IN', {
              maximumFractionDigits: 2,
            }),
            fee: fee.toLocaleString('en-IN'),
            total: total.toLocaleString('en-IN', {
              maximumFractionDigits: 2,
            }),
          })}
        </Text>
      </View>
    </FormScreen>
  );
};

const styles = StyleSheet.create({
  heading: { gap: 4 },
  overline: {
    fontFamily: FONTS.semiBold,
    fontSize: 9,
    lineHeight: 14,
    textTransform: 'uppercase',
  },
  row: { flexDirection: 'row', gap: 8 },
  multiline: { minHeight: 64, paddingTop: 10 },
  field: { flex: 1, gap: 6 },
  fieldLabel: { fontFamily: FONTS.regular, fontSize: 11, lineHeight: 16 },
  readOnlyField: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  readOnlyText: { fontFamily: FONTS.regular, fontSize: 13, lineHeight: 18 },
  details: { borderWidth: 1, borderRadius: 10, padding: 8 },
  detailsText: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 13 },
  locationHint: { fontFamily: FONTS.regular, fontSize: 10, lineHeight: 14 },
});
