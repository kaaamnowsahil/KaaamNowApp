import { useEffect, useState, type FC } from 'react';
import { Linking, StyleSheet, View } from 'react-native';

import MapPinIcon from '@/assets/figma/map-pin.svg';
import PhoneIcon from '@/assets/figma/phone.svg';
import CircleCheckIcon from '@/assets/icons/circle-check.svg';
import CircleHelpIcon from '@/assets/icons/circle-help.svg';
import ClockIcon from '@/assets/icons/clock.svg';
import MessageCircleIcon from '@/assets/icons/message-circle.svg';
import { DetailRow, InfoCallout } from '@/components/liveShift';
import {
  BottomSheet,
  PrimaryButton,
  SecondaryButton,
} from '@/components/ui';
import type { Shift } from '@/types';
import { mapsUrl } from '@/utils/links';

import { SHIFT_CHECK_IN_STRINGS as S } from '../constants';
import { CHECK_IN_HELP as H } from '../mock';

type ManualState = 'idle' | 'waiting' | 'confirmed';

/**
 * "I need help checking in". Not in Figma; built from the bottom sheet,
 * divided icon rows and Screen actions styles used across the live flow.
 * Mount it only while open.
 */
export const CheckInHelpSheet: FC<{
  shift: Shift;
  onCheckedIn: () => void;
  onClose: () => void;
}> = ({ shift, onCheckedIn, onClose }) => {
  const [manual, setManual] = useState<ManualState>('idle');

  useEffect(() => {
    if (manual !== 'waiting') {
      return;
    }
    const timer = setTimeout(() => setManual('confirmed'), H.confirmAfterMs);
    return () => clearTimeout(timer);
  }, [manual]);

  const sms = encodeURIComponent(S.arrivedSms(H.leadFirstName, shift.title));

  return (
    <BottomSheet
      title={S.HELP_TITLE}
      subtitle={S.HELP_SUBTITLE}
      onClose={onClose}
      closeLabel={S.CLOSE}
      testID="check-in-help-sheet"
    >
      <View>
        <DetailRow
          icon={PhoneIcon}
          title={S.CALL_LEAD}
          caption={S.leadCaption(H.leadName, H.leadReplyTime)}
          onPress={() => Linking.openURL(`tel:${H.leadPhone}`)}
        />
        <DetailRow
          icon={MessageCircleIcon}
          title={S.MESSAGE_LEAD}
          caption={S.MESSAGE_CAPTION}
          onPress={() => Linking.openURL(`sms:${H.leadPhone}?body=${sms}`)}
        />
        <DetailRow
          icon={MapPinIcon}
          title={S.CANT_FIND}
          caption={S.directionsTo(shift.businessName)}
          onPress={() =>
            Linking.openURL(mapsUrl(`${shift.businessName}, ${shift.area}`))
          }
        />
        <DetailRow
          icon={CircleHelpIcon}
          title={S.SUPPORT}
          caption={S.supportCaption(H.supportHours, H.supportPhoneLabel)}
          onPress={() => Linking.openURL(`tel:${H.supportPhone}`)}
          isLast
        />
      </View>

      {manual === 'waiting' ? (
        <InfoCallout icon={ClockIcon} text={S.waiting(H.leadFirstName)} />
      ) : manual === 'confirmed' ? (
        <InfoCallout
          icon={CircleCheckIcon}
          text={S.confirmed(H.leadFirstName)}
        />
      ) : null}

      <View style={styles.actions}>
        {manual === 'confirmed' ? (
          <PrimaryButton
            label={S.START_SHIFT}
            onPress={onCheckedIn}
            testID="check-in-help-start"
          />
        ) : (
          <PrimaryButton
            label={manual === 'waiting' ? S.WAITING_BUTTON : S.ASK_MANUAL}
            disabled={manual === 'waiting'}
            onPress={() => setManual('waiting')}
            testID="check-in-help-manual"
          />
        )}
        <SecondaryButton label={S.CLOSE} onPress={onClose} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actions: { gap: 10, marginTop: 4 },
});
