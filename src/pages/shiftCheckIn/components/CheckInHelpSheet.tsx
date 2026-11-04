import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, StyleSheet, View } from 'react-native';

import MapPinIcon from '@/assets/figma/map-pin.svg';
import PhoneIcon from '@/assets/figma/phone.svg';
import CircleHelpIcon from '@/assets/icons/circle-help.svg';
import MessageCircleIcon from '@/assets/icons/message-circle.svg';
import { DetailRow } from '@/components/shiftFlow';
import { BottomSheet, SecondaryButton } from '@/components/ui';
import { BRAND } from '@/constants/brand';
import type { Shift } from '@/types';
import { mapsUrl, whatsappUrl } from '@/utils/links';

export type ShiftContact = { name: string; phone: string };

/**
 * "I need help checking in". Not in Figma; built from the bottom sheet,
 * divided icon rows and Screen actions styles used across the live flow.
 * Contact comes from GET /assignments/{id}/contact. Mount it only while open.
 */
export const CheckInHelpSheet: FC<{
  shift: Shift;
  contact: ShiftContact | null;
  onClose: () => void;
}> = ({ shift, contact, onClose }) => {
  const { t } = useTranslation();
  const leadName = contact?.name ?? '';
  const arrivedText = t('workerFlow.checkIn.arrivedSms', {
    lead: leadName.split(' ')[0],
    role: shift.title,
  });

  return (
    <BottomSheet
      title={t('workerFlow.checkIn.helpTitle')}
      subtitle={t('workerFlow.checkIn.helpSubtitle')}
      onClose={onClose}
      closeLabel={t('workerFlow.checkIn.close')}
      testID="check-in-help-sheet"
    >
      <View>
        {contact?.phone ? (
          <>
            <DetailRow
              icon={PhoneIcon}
              title={t('workerFlow.checkIn.callLead')}
              caption={leadName}
              onPress={() => Linking.openURL(`tel:${contact.phone}`)}
            />
            <DetailRow
              icon={MessageCircleIcon}
              title={t('workerFlow.checkIn.messageLead')}
              caption={t('workerFlow.checkIn.messageCaption')}
              onPress={() => Linking.openURL(whatsappUrl(contact.phone, arrivedText))}
            />
          </>
        ) : null}
        <DetailRow
          icon={MapPinIcon}
          title={t('workerFlow.checkIn.cantFind')}
          caption={t('workerFlow.checkIn.directionsTo', {
            business: shift.businessName,
          })}
          onPress={() =>
            Linking.openURL(
              mapsUrl(`${shift.businessName}, ${shift.addressText || shift.area}`),
            )
          }
        />
        <DetailRow
          icon={CircleHelpIcon}
          title={t('workerFlow.checkIn.support')}
          caption={BRAND.SUPPORT_WHATSAPP_LABEL}
          onPress={() => Linking.openURL(whatsappUrl(BRAND.SUPPORT_WHATSAPP))}
          isLast
        />
      </View>

      <View style={styles.actions}>
        <SecondaryButton label={t('workerFlow.checkIn.close')} onPress={onClose} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  actions: { gap: 10, marginTop: 4 },
});
