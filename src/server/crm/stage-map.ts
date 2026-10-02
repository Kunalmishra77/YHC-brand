import 'server-only';

import { LEAD_STAGES, MANUAL_LEAD_STAGES, type LeadStage } from '@/lib/domain/types';

/** TRD §6.3 — which stage a domain event moves a lead to. */
export type StageEvent =
  | { type: 'lead.created' }
  | { type: 'consult_link.sent' }
  | { type: 'appointment.held' }
  | { type: 'payment.consultation.captured' }
  | { type: 'consultation.completed' }
  | { type: 'recommendation.sent' }
  | { type: 'order.paid'; source: 'recommendation' | 'shop' | 'reorder' | 'manual' | 'subscription' }
  | { type: 'order.delivered' }
  | { type: 'refill.first_reminder_sent' };

export function stageForEvent(event: StageEvent): LeadStage {
  switch (event.type) {
    case 'lead.created':
      return 'new';
    case 'consult_link.sent':
      return 'consult_link_sent';
    case 'appointment.held':
      return 'consult_booked';
    case 'payment.consultation.captured':
      return 'payment_successful';
    case 'consultation.completed':
      return 'consult_completed';
    case 'recommendation.sent':
      return 'product_recommended';
    case 'order.paid':
      return event.source === 'reorder' ? 'followup_active' : 'product_purchased';
    case 'order.delivered':
      return 'followup_active';
    case 'refill.first_reminder_sent':
      return 'reorder_due';
  }
}

const rank = (stage: LeadStage) => LEAD_STAGES.indexOf(stage);
const RETENTION_LOOP: readonly LeadStage[] = ['followup_active', 'reorder_due', 'reordered'];

/**
 * Mirrors SQL `advance_lead_stage`: forward-only; the retention loop may cycle;
 * a system event re-opens a lost lead.
 */
export function advanceStage(current: LeadStage, target: LeadStage): LeadStage {
  if (current === 'lost') return target;
  if (RETENTION_LOOP.includes(current) && RETENTION_LOOP.includes(target)) return target;
  return rank(target) > rank(current) ? target : current;
}

/** Mirrors SQL `set_lead_stage_manual`: people may only use the first five stages and Lost, and only before booking. */
export function canSetManually(current: LeadStage, target: LeadStage): boolean {
  const manual: readonly LeadStage[] = MANUAL_LEAD_STAGES;
  if (!manual.includes(target)) return false;
  return manual.includes(current);
}
