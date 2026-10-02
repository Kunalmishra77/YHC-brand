import { formatInTimeZone } from 'date-fns-tz';
import type { ChipTone } from '@/components/shared/status-chip';
import type {
  AppointmentStatus,
  GuaranteeClaimStatus,
  JobStatus,
  MessageStatus,
  OrderStatus,
} from '@/lib/domain/types';
import { IST } from '@/lib/time';

/** Presentation helpers shared by admin server and client components. */

export function formatPct(value: number | null, digits = 0): string {
  if (value === null) return '—';
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatCount(n: number): string {
  return new Intl.NumberFormat('en-IN').format(n);
}

/** Compact INR for chart axes: ₹0, ₹500, ₹14.5K, ₹1.2L. */
export function formatINRCompact(paise: number): string {
  const r = paise / 100;
  if (r >= 100_000) return `₹${(r / 100_000).toFixed(r >= 1_000_000 ? 0 : 1)}L`;
  if (r >= 1_000) return `₹${(r / 1_000).toFixed(r >= 10_000 ? 0 : 1)}K`;
  return `₹${Math.round(r)}`;
}

export const istDateTime = (iso: string) =>
  formatInTimeZone(new Date(iso), IST, "d MMM yyyy, h:mm aaa 'IST'");
export const istShort = (iso: string) => formatInTimeZone(new Date(iso), IST, 'd MMM, h:mm aaa');
export const istDay = (iso: string) => formatInTimeZone(new Date(iso), IST, 'd MMM yyyy');
/** `YYYY-MM-DD` (already an IST business date) → `2 Oct` */
export const dateLabel = (date: string, withYear = false) =>
  formatInTimeZone(new Date(`${date}T12:00:00Z`), 'UTC', withYear ? 'd MMM yyyy' : 'd MMM');

export const ORDER_TONE: Record<OrderStatus, ChipTone> = {
  pending_payment: 'pending',
  paid: 'info',
  processing: 'pending',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'neutral',
  refunded: 'neutral',
  partially_refunded: 'warning',
  rto: 'danger',
};

export const APPOINTMENT_TONE: Record<AppointmentStatus, ChipTone> = {
  held: 'pending',
  booked: 'info',
  completed: 'success',
  no_show: 'danger',
  cancelled: 'neutral',
  rescheduled: 'neutral',
  expired: 'neutral',
};

export const JOB_TONE: Record<JobStatus, ChipTone> = {
  pending: 'pending',
  running: 'info',
  done: 'success',
  failed: 'danger',
  cancelled: 'neutral',
};

export const MESSAGE_TONE: Record<MessageStatus, ChipTone> = {
  queued: 'pending',
  sent: 'info',
  delivered: 'success',
  read: 'success',
  failed: 'danger',
  received: 'neutral',
};

export const CLAIM_LABEL: Record<GuaranteeClaimStatus, [string, ChipTone]> = {
  submitted: ['Submitted', 'pending'],
  under_review: ['Under review', 'info'],
  approved: ['Approved', 'success'],
  rejected: ['Rejected', 'danger'],
  refunded: ['Refunded', 'success'],
  withdrawn: ['Withdrawn', 'neutral'],
};
