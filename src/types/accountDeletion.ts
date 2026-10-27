export type DeletionRequestStatus =
  | 'pending'
  | 'approved'
  | 'on_hold'
  | 'completed';

export type DeletionHold = {
  id: string;
  basis: string;
  reason: string;
  reference: string | null;
  expires_at: string;
};

export type DeletionRequest = {
  id: string;
  status: DeletionRequestStatus;
  requested_at: string;
  approved_at: string | null;
  completed_at: string | null;
  blockers: string[];
  holds: DeletionHold[];
};

export type DeletionDetailProps = { label: string; value: string | null };
