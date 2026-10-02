import type { HairConcern, RecommendationStatus } from '@/lib/domain/types';
import type { ChipTone } from '@/components/shared/status-chip';

/** Pure display helpers for the doctor portal (safe in server and client components). */

const CONCERN_LABEL: Record<HairConcern, string> = {
  hair_fall: 'Hair fall',
  thinning: 'Overall thinning',
  receding_hairline: 'Receding hairline',
  crown_thinning: 'Crown thinning',
  dandruff_scalp: 'Dandruff & scalp',
  other: 'Other',
};

export function concernLabel(concern: HairConcern): string {
  return CONCERN_LABEL[concern];
}

/** `+919000000002` → `+91 90000 •••02` — enough to confirm identity on a call, not to copy. */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.slice(-10);
  if (local.length < 10) return '•••';
  return `+91 ${local.slice(0, 5)} •••${local.slice(-2)}`;
}

export function genderLabel(gender: 'male' | 'female' | 'other'): string {
  return gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Other';
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

const REC_STATUS: Record<RecommendationStatus, { label: string; tone: ChipTone }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  sent: { label: 'Sent · awaiting payment', tone: 'pending' },
  paid: { label: 'Paid · plan purchased', tone: 'success' },
  expired: { label: 'Link expired', tone: 'danger' },
  declined: { label: 'Declined', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
};

export function recommendationStatus(status: RecommendationStatus) {
  return REC_STATUS[status];
}

/** `HH:MM` → minutes after midnight. */
export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${suffix}` : `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export const WEEKDAYS_MON_FIRST: { day: number; short: string; long: string }[] = [
  { day: 1, short: 'Mon', long: 'Monday' },
  { day: 2, short: 'Tue', long: 'Tuesday' },
  { day: 3, short: 'Wed', long: 'Wednesday' },
  { day: 4, short: 'Thu', long: 'Thursday' },
  { day: 5, short: 'Fri', long: 'Friday' },
  { day: 6, short: 'Sat', long: 'Saturday' },
  { day: 0, short: 'Sun', long: 'Sunday' },
];
