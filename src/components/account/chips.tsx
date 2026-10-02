import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import { t } from '@/i18n/en';
import type { AppointmentStatus, GuaranteeClaimStatus, OrderStatus } from '@/lib/domain/types';

const APPT_TONE: Record<AppointmentStatus, ChipTone> = {
  held: 'pending',
  booked: 'info',
  completed: 'success',
  no_show: 'warning',
  cancelled: 'neutral',
  rescheduled: 'neutral',
  expired: 'neutral',
};

const ORDER_TONE: Record<OrderStatus, ChipTone> = {
  pending_payment: 'pending',
  paid: 'info',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'neutral',
  refunded: 'neutral',
  partially_refunded: 'neutral',
  rto: 'warning',
};

/** Customer-facing wording (the staff label "Paid · to pack" is not meant for customers). */
const ORDER_WORDS: Partial<Record<OrderStatus, string>> = {
  paid: 'Paid · preparing',
  processing: 'Packing your order',
  shipped: 'On its way',
};

const CLAIM: Record<GuaranteeClaimStatus, { tone: ChipTone; words: string }> = {
  submitted: { tone: 'pending', words: 'Submitted' },
  under_review: { tone: 'info', words: 'Doctor reviewing' },
  approved: { tone: 'success', words: 'Approved · refund on its way' },
  rejected: { tone: 'danger', words: 'Not approved' },
  refunded: { tone: 'success', words: 'Refunded' },
  withdrawn: { tone: 'neutral', words: 'Withdrawn' },
};

export function AppointmentChip({ status }: { status: AppointmentStatus }) {
  const words = status === 'booked' ? 'Booked · paid' : t(`status.appointment.${status}`);
  return <StatusChip tone={APPT_TONE[status]}>{words}</StatusChip>;
}

export function OrderChip({ status }: { status: OrderStatus }) {
  return (
    <StatusChip tone={ORDER_TONE[status]}>{ORDER_WORDS[status] ?? t(`status.order.${status}`)}</StatusChip>
  );
}

export function ClaimChip({ status }: { status: GuaranteeClaimStatus }) {
  const c = CLAIM[status];
  return <StatusChip tone={c.tone}>{c.words}</StatusChip>;
}
