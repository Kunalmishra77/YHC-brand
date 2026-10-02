import type { ChipTone } from '@/components/shared/status-chip';
import type { LeadSource, LeadStage } from '@/lib/domain/types';

/** Shared sales copy and tone maps (usable from server and client components). */
export const SOURCE_LABELS: Record<LeadSource, string> = {
  meta_ads: 'Meta ads',
  whatsapp: 'WhatsApp',
  website: 'Website',
  sales: 'Sales (manual)',
  referral: 'Referral',
  google: 'Google',
};

export const LEAD_SOURCES = Object.keys(SOURCE_LABELS) as LeadSource[];

/** FR-M7-3 — first five stages + Lost are set by people (mirrors MANUAL_LEAD_STAGES). */
export const MANUAL_STAGE_SET: ReadonlySet<LeadStage> = new Set<LeadStage>([
  'new',
  'contacted',
  'interested',
  'consult_suggested',
  'consult_link_sent',
  'lost',
]);

export function stageTone(stage: LeadStage): ChipTone {
  switch (stage) {
    case 'new':
      return 'info';
    case 'contacted':
    case 'interested':
    case 'consult_suggested':
    case 'consult_link_sent':
      return 'neutral';
    case 'consult_booked':
    case 'product_recommended':
    case 'reorder_due':
      return 'pending';
    case 'lost':
      return 'danger';
    default:
      return 'success';
  }
}

export const SYSTEM_STAGE_HINT = 'Moves automatically from bookings and payments';

export const LOST_REASONS = [
  'Price concern',
  'Not interested now',
  'Chose another clinic',
  'Not reachable',
  'Wrong number / spam',
  'Other',
] as const;

export const CALL_OUTCOMES = [
  'Connected',
  'No answer',
  'Busy',
  'Asked to call back',
  'Switched off',
  'Wrong number',
] as const;

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
