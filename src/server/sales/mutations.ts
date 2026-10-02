import 'server-only';

import type { Task } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { requireRole, type SessionUser } from '@/lib/rbac';
import { STAFF } from '@/server/demo/fixtures';
import { db, logLeadActivity } from '@/server/demo/store';

/** Sales CRM gate: sales or admin; admin needs aal2 (TRD §5.3, ROUTE_ROLES). */
export async function requireSales(): Promise<SessionUser> {
  const user = await requireRole(['sales', 'admin']);
  if (user.role === 'admin' && user.aal !== 'aal2')
    throw new AppError('mfa_required', 'Two-factor verification required.', 403);
  return user;
}

/*
 * The demo store has no reassign / create-task functions yet; these mutate the demo state the same
 * way the store does (activity on the timeline). Phase 07 replaces them with RPCs.
 */

let localSeq = 0;
const localId = (prefix: string) => `${prefix}-sales-${Date.now().toString(36)}-${++localSeq}`;

/** FR-M7-7 manual reassign. */
export function reassignLead(leadId: string, ownerId: string, actor: string): void {
  const lead = db().leads.find((l) => l.id === leadId);
  if (!lead) throw new AppError('not_found', 'Lead not found', 404);
  const owner = STAFF.find((u) => u.id === ownerId && u.role === 'sales' && u.active);
  if (!owner) throw new AppError('invalid_owner', 'Pick an active sales team member.', 422);
  if (lead.ownerId === ownerId) return;
  lead.ownerId = ownerId;
  lead.updatedAt = new Date().toISOString();
  logLeadActivity(lead.id, 'note', `Owner → ${owner.name}`, actor);
  // Keep the lead's open tasks with the new owner.
  for (const task of db().tasks)
    if (task.leadId === lead.id && task.status === 'open') task.ownerId = ownerId;
}

/** FR-M7-8 "Task" quick action. */
export function createSalesTask(input: {
  leadId: string;
  title: string;
  dueAt: Date;
  ownerId: string;
  actor: string;
}): Task {
  const lead = db().leads.find((l) => l.id === input.leadId);
  if (!lead) throw new AppError('not_found', 'Lead not found', 404);
  const task: Task = {
    id: localId('task'),
    leadId: lead.id,
    title: input.title,
    kind: 'manual',
    urgent: false,
    status: 'open',
    ownerId: input.ownerId,
    dueAt: input.dueAt.toISOString(),
  };
  db().tasks.push(task);
  logLeadActivity(lead.id, 'note', `Task added: ${input.title}`, input.actor);
  return task;
}

/** Sets the lead's next action (shown on cards / list). */
export function setNextAction(leadId: string, nextAction: string, at: Date): void {
  const lead = db().leads.find((l) => l.id === leadId);
  if (!lead) return;
  lead.nextAction = nextAction;
  lead.nextActionAt = at.toISOString();
}

export function touchLead(leadId: string): void {
  const lead = db().leads.find((l) => l.id === leadId);
  if (lead) lead.updatedAt = new Date().toISOString();
}
