import { getDevicePosition } from '@/services/maps/devicePosition';

import { liveWorkApi } from './liveWorkApi';
import { isRequestTaken, liveErrorText } from './liveWorkFormat';
import { askToShareLocation } from './locationPrompt';
import { LIVE_TEXT as S } from './liveWorkStrings';

export type AcceptedLiveOffer = { assignmentId: string };

/** Accepts one Live Work offer. Null when location is off (the prompt is already shown). */
export async function acceptLiveOffer(
  bookingId: string,
): Promise<AcceptedLiveOffer | null> {
  const point = await getDevicePosition(8000);
  if (!point) {
    askToShareLocation(S.needLocation);
    return null;
  }
  await liveWorkApi.reportWorkerLocation(point);
  const booking = await liveWorkApi.accept(bookingId);
  return { assignmentId: booking.assignment_id };
}

export function liveOfferError(cause: unknown): string {
  return isRequestTaken(cause) ? S.taken : liveErrorText(cause);
}
