import { StatusChip, type ChipTone } from '@/components/shared/status-chip';
import type { ScanOutcome } from '@/lib/scan/rules';

/* Small shared pieces of the real sales portal (ADR-36). Status chips always carry words. */

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

/** "+919876543210" → "+91 98765 43210" */
export function prettyPhone(phone: string): string {
  const m = phone.match(/^\+91(\d{5})(\d{5})$/);
  return m ? `+91 ${m[1]} ${m[2]}` : phone;
}

/** WhatsApp chat link (opens the salesperson's own WhatsApp; nothing is sent by us). */
export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}
