import { IST, startOfIstDay } from '@/lib/time';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

/*
 * Sales playbook (ADR-37): call results, follow-up times, lost reasons and ready WhatsApp messages.
 * Pure functions — shared by the sales pages, the server actions and tests.
 * WhatsApp text never contains clinical details (CLAUDE.md): no result, no photos, no answers.
 */

export const CALL_RESULTS = [
  { id: 'answered', label: 'Spoke to them' },
  { id: 'no_answer', label: 'No answer' },
  { id: 'busy', label: 'Busy / cut the call' },
  { id: 'switched_off', label: 'Switched off' },
  { id: 'call_back', label: 'Asked to call later' },
  { id: 'wrong_number', label: 'Wrong number' },
] as const;
export type CallResult = (typeof CALL_RESULTS)[number]['id'];
export const CALL_RESULT_IDS = CALL_RESULTS.map((r) => r.id) as [CallResult, ...CallResult[]];

export function callResultLabel(id: string): string {
  return CALL_RESULTS.find((r) => r.id === id)?.label ?? id;
}

/** Results where we try again automatically a little later. */
export const RETRY_RESULTS: readonly CallResult[] = ['no_answer', 'busy', 'switched_off'];

export const LOST_REASONS = [
  'Not interested',
  'Price too high',
  'No answer after 3 tries',
  'Wrong number',
  'Bought elsewhere',
  'Not eligible — explained honestly',
  'Other',
] as const;

/** What can be sold without a doctor (the prescription solution is not on this list — PROGRESS "Waiting on client"). */
export const SOLD_PRODUCTS = ['Hair Nourishing Tablets', 'Hair Regrowth Capsules', 'Tablets + Capsules', 'Other'] as const;

const WORK_START_H = 10;
const WORK_END_H = 19;

function istHour(d: Date): number {
  return Number(formatInTimeZone(d, IST, 'H'));
}

/** `HH:mm` IST on the IST day of `day` plus `addDays` days. */
export function istAt(day: Date, addDays: number, hhmm: string): Date {
  const base = new Date(startOfIstDay(day).getTime() + addDays * 86_400_000 + 12 * 3_600_000);
  return fromZonedTime(`${formatInTimeZone(base, IST, 'yyyy-MM-dd')}T${hhmm}:00`, IST);
}

/** Next try after a missed call: 3 hours later, moved to 11 am if that falls outside 10 am–7 pm IST. */
export function retryAt(now: Date): Date {
  const later = new Date(now.getTime() + 3 * 3_600_000);
  const h = istHour(later);
  const sameDay = formatInTimeZone(later, IST, 'yyyy-MM-dd') === formatInTimeZone(now, IST, 'yyyy-MM-dd');
  if (sameDay && h >= WORK_START_H && h < WORK_END_H) return later;
  // Too late today (or after midnight): 11 am on the next working morning.
  return istHour(now) < WORK_START_H && sameDay ? istAt(now, 0, '11:00') : istAt(now, 1, '11:00');
}

export function quickFollowUps(now: Date): { id: string; label: string; at: Date }[] {
  return [
    { id: 'in2h', label: 'In 2 hours', at: new Date(now.getTime() + 2 * 3_600_000) },
    { id: 'tomorrow11', label: 'Tomorrow 11 am', at: istAt(now, 1, '11:00') },
    { id: 'tomorrow18', label: 'Tomorrow 6 pm', at: istAt(now, 1, '18:00') },
    { id: 'in3d', label: 'In 3 days', at: istAt(now, 3, '11:00') },
    { id: 'in7d', label: 'Next week', at: istAt(now, 7, '11:00') },
  ];
}

export type FollowUpState = 'overdue' | 'today' | 'later';

export function followUpState(nextActionAt: string | null, now: Date): FollowUpState | null {
  if (!nextActionAt) return null;
  const at = Date.parse(nextActionAt);
  if (at < now.getTime()) return 'overdue';
  return at < startOfIstDay(now).getTime() + 86_400_000 ? 'today' : 'later';
}

/** The end of today in IST (UTC instant) — "due today" means next_action_at before this. */
export function endOfIstToday(now: Date): Date {
  return new Date(startOfIstDay(now).getTime() + 86_400_000);
}

export const WHATSAPP_TEMPLATES = [
  { id: 'intro', label: 'First hello' },
  { id: 'missed_call', label: 'We tried to call' },
  { id: 'rescan', label: 'Please scan again' },
  { id: 'thanks', label: 'Thanks after the call' },
] as const;
export type WhatsAppTemplate = (typeof WHATSAPP_TEMPLATES)[number]['id'];
export const WHATSAPP_TEMPLATE_IDS = WHATSAPP_TEMPLATES.map((t) => t.id) as [WhatsAppTemplate, ...WhatsAppTemplate[]];

export function whatsappText(
  template: WhatsAppTemplate,
  ctx: { name: string; member: string | null; siteUrl?: string },
): string {
  const first = ctx.name.trim().split(/\s+/)[0] || 'there';
  const me = ctx.member ? `${ctx.member} from Your Hair Company` : 'the Your Hair Company team';
  const site = ctx.siteUrl ?? 'https://yourhaircompany.com';
  switch (template) {
    case 'intro':
      return `Hi ${first}, this is ${me}. Thank you for taking the free scalp scan. When is a good time for a short call about your result?`;
    case 'missed_call':
      return `Hi ${first}, this is ${me}. We tried to call you about your free scalp scan. When is a good time to call you back?`;
    case 'rescan':
      return `Hi ${first}, this is ${me}. Some of your scan photos were not clear enough. Could you take the scan again in good light? It takes a few minutes: ${site}/start`;
    case 'thanks':
      return `Hi ${first}, thank you for your time on the call today. If you have any questions, just reply here. — ${me}`;
  }
}

/** wa.me link with the message filled in (opens the salesperson's own WhatsApp; nothing is sent by us). */
export function whatsappLink(phone: string, text?: string): string {
  const base = `https://wa.me/${phone.replace(/\D/g, '')}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Plain-English labels for the scan answers (sales view, ADR-37). */
export const ANSWER_LABELS: Record<string, { q: string; a: Record<string, string> }> = {
  duration: {
    q: 'Hair loss for',
    a: { lt_1y: 'Less than 1 year', '1_3y': '1–3 years', '3_5y': '3–5 years', gt_5y: 'More than 5 years' },
  },
  pattern: {
    q: 'Where they notice it',
    a: {
      hairline: 'Hairline',
      crown: 'Crown',
      diffuse: 'All over',
      parting: 'Parting',
      patches: 'Patches',
      not_sure: 'Not sure',
    },
  },
  longBald: {
    q: 'Areas bald for a long time',
    a: { no: 'No', small: 'Small areas', large: 'Large areas' },
  },
  familyHistory: { q: 'Family history', a: { yes: 'Yes', no: 'No', not_sure: 'Not sure' } },
};
