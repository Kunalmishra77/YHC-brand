import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import { followUpState, whatsappLink } from '@/lib/sales/playbook';
import type { OutcomeReason, ScanOutcome } from '@/lib/scan/rules';

/* Small shared pieces of the real sales portal (ADR-36, ADR-37). Status chips always carry words. */

const OUTCOME: Record<ScanOutcome, { tone: ChipTone; label: string }> = {
  eligible: { tone: 'success', label: 'Eligible' },
  not_eligible: { tone: 'neutral', label: 'Not eligible' },
  unclear: { tone: 'warning', label: 'Needs a closer look' },
};

export function OutcomeChip({ outcome }: { outcome: ScanOutcome | null }) {
  if (!outcome) return <StatusChip tone="pending">Scan not finished</StatusChip>;
  const o = OUTCOME[outcome];
  return <StatusChip tone={o.tone}>{o.label}</StatusChip>;
}

const STAGE: Record<string, { tone: ChipTone; label: string }> = {
  new: { tone: 'info', label: 'New' },
  contacted: { tone: 'pending', label: 'Contacted' },
  interested: { tone: 'warning', label: 'Interested' },
  product_purchased: { tone: 'success', label: 'Sold' },
  lost: { tone: 'danger', label: 'Lost' },
};

export function StageChip({ stage }: { stage: string }) {
  const s = STAGE[stage] ?? { tone: 'neutral' as ChipTone, label: stage.replaceAll('_', ' ') };
  return <StatusChip tone={s.tone}>{s.label}</StatusChip>;
}

/** "Call back today 5:30 pm" / "Overdue since …" — only for open leads. */
export function FollowUpChip({ at, stage, now }: { at: string | null; stage: string; now: Date }) {
  if (stage === 'product_purchased' || stage === 'lost') return null;
  const state = followUpState(at, now);
  if (!state || !at) return null;
  if (state === 'overdue') return <StatusChip tone="danger">Call overdue · {istDateTime(at)}</StatusChip>;
  if (state === 'today') return <StatusChip tone="warning">Call today · {istTime(at)}</StatusChip>;
  return <StatusChip tone="pending">Call {istDateTime(at)}</StatusChip>;
}

export const REASON_TEXT: Record<OutcomeReason, string> = {
  hair_visible: 'Hair and roots are visible in the areas checked.',
  no_hair_shiny_scalp: 'Smooth, shiny scalp with no hair in most main areas.',
  older_age: 'Older age, with bare areas.',
  long_bald_area: 'They said large areas have been bald for a long time.',
  photos_unclear: 'Photos were not clear enough to judge.',
  no_hair_younger: 'Very little hair in the main areas, but younger age.',
};

export function istDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function istTime(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }).format(
    new Date(iso),
  );
}

/** "5 min ago", "3 h ago", "2 days ago" */
export function ago(iso: string | null, now: Date): string {
  if (!iso) return 'never';
  const min = Math.max(0, Math.round((now.getTime() - Date.parse(iso)) / 60_000));
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? '' : 's'} ago`;
}

/** "+919876543210" → "+91 98765 43210" */
export function prettyPhone(phone: string): string {
  const m = phone.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : phone;
}

/** WhatsApp chat link (opens the salesperson's own WhatsApp; nothing is sent by us). */
export function whatsappHref(phone: string): string {
  return whatsappLink(phone);
}

/** Where the lead came from, in plain words. */
export function sourceLabel(source: string | null, campaign: string | null): string {
  const s = (source ?? 'website').toLowerCase();
  const name =
    s === 'website' || s === 'direct'
      ? 'Website'
      : s.includes('google')
        ? 'Google'
        : s.includes('insta') || s === 'ig'
          ? 'Instagram'
          : s.includes('facebook') || s === 'fb' || s === 'meta'
            ? 'Facebook'
            : s.includes('whatsapp')
              ? 'WhatsApp'
              : source ?? 'Website';
  return campaign ? `${name} · ${campaign}` : name;
}
