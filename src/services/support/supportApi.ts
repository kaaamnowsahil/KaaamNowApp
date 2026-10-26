import { apiRequest } from '@/services/api/apiClient';

export type SupportTicket = {
  id: string;
  topic: string;
  subject: string;
  status: string;
  priority: 'normal' | 'urgent';
  assignment_id?: string | null;
  created_at: string;
};

export const supportApi = {
  /** Urgent ticket on a booking; admins are notified straight away. */
  emergency: (assignmentId: string, message = '') =>
    apiRequest<SupportTicket>('POST', '/support/emergency', {
      body: { assignment_id: assignmentId, message },
    }),
};
