import type { BusinessLiveRequest } from '@/types';

export const getBusinessLivePaymentTotal = (
  request: BusinessLiveRequest,
) => {
  const subtotal =
    request.acceptedWorkers.length * request.hourlyRate * request.hours;
  const fee = Math.round(subtotal * 0.05);
  return subtotal + fee;
};
