'use client';

import { CalendarClock, ListChecks, PhoneCall, Send, StickyNote, CircleX } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  addNoteAction,
  bookOnBehalfAction,
  createTaskAction,
  logCallAction,
  moveLeadStageAction,
  reassignLeadAction,
  sendConsultLinkAction,
} from '@/app/sales/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { LeadStage } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import type { SlotDay } from '@/server/sales/views';
import { CALL_OUTCOMES, MANUAL_STAGE_SET } from './labels';
import { LostDialog } from './lost-dialog';
import { FieldLabel, NativeSelect, inputClass } from './native-select';

type Panel = 'book' | 'call' | 'note' | 'task' | 'lost' | null;

const textareaClass =
  'min-h-24 w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none';

/** FR-M7-8 quick actions on the lead detail. */
export function LeadQuickActions({
  leadId,
  leadName,
  stage,
  slots,
  holdMinutes,
  holdFromSetting,
  defaultDue,
}: {
  leadId: string;
  leadName: string;
  stage: LeadStage;
  slots: SlotDay[];
  holdMinutes: number;
  holdFromSetting: boolean;
  /** `YYYY-MM-DDTHH:mm` IST, computed on the server */
  defaultDue: string;
}) {
  const [panel, setPanel] = useState<Panel>(null);
  const [pending, start] = useTransition();
  const manual = MANUAL_STAGE_SET.has(stage);

  function runAction(
    fn: () => Promise<{ ok: true } | { ok: false; error: { message: string } }>,
    success: string,
  ) {
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(success);
        setPanel(null);
      } else toast.error(res.error.message);
    });
  }

  const close = (o: boolean) => (o ? null : setPanel(null));

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <ActionButton
          icon={<Send />}
          label="Send consult link"
          disabled={pending}
          onClick={() => runAction(() => sendConsultLinkAction(leadId), 'Consultation link sent on WhatsApp')}
        />
        <ActionButton
          icon={<CalendarClock />}
          label="Book on behalf"
          disabled={pending}
          onClick={() => setPanel('book')}
        />
        <ActionButton
          icon={<PhoneCall />}
          label="Log call"
          disabled={pending}
          onClick={() => setPanel('call')}
        />
        <ActionButton
          icon={<StickyNote />}
          label="Add note"
          disabled={pending}
          onClick={() => setPanel('note')}
        />
        <ActionButton
          icon={<ListChecks />}
          label="Create task"
          disabled={pending}
          onClick={() => setPanel('task')}
        />
        <ActionButton
          icon={<CircleX />}
          label="Mark lost"
          tone="danger"
          disabled={pending || !manual || stage === 'lost'}
          title={!manual ? 'Leads past booking cannot be marked lost by hand' : undefined}
          onClick={() => setPanel('lost')}
        />
      </div>

      <BookDialog
        open={panel === 'book'}
        onOpenChange={close}
        leadName={leadName}
        slots={slots}
        holdMinutes={holdMinutes}
        holdFromSetting={holdFromSetting}
        pending={pending}
        onConfirm={(iso) =>
          start(async () => {
            const res = await bookOnBehalfAction({ leadId, startsAt: iso });
            if (res.ok) {
              toast.success(`Pay link sent on WhatsApp · hold until ${res.data.holdUntil}`, {
                description: `${res.data.code} held for ${leadName}. Becomes "₹500 paid" when the payment is captured.`,
                duration: 8000,
              });
              setPanel(null);
            } else toast.error(res.error.message);
          })
        }
      />

      <Dialog open={panel === 'call'} onOpenChange={close}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log call with {leadName}</DialogTitle>
            <DialogDescription>
              Keep notes about sales only. Health details belong with the doctor.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            action={(fd) =>
              runAction(
                () =>
                  logCallAction({
                    leadId,
                    outcome: String(fd.get('outcome') ?? ''),
                    note: String(fd.get('note') ?? '') || undefined,
                  }),
                'Call logged',
              )
            }
          >
            <div>
              <FieldLabel htmlFor="call-outcome">Outcome</FieldLabel>
              <NativeSelect id="call-outcome" name="outcome" defaultValue={CALL_OUTCOMES[0]}>
                {CALL_OUTCOMES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </NativeSelect>
            </div>
            <div>
              <FieldLabel htmlFor="call-note">Note (optional)</FieldLabel>
              <textarea
                id="call-note"
                name="note"
                maxLength={500}
                className={textareaClass}
                placeholder="e.g. Will book after salary on the 5th"
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="h-11" disabled={pending}>
                {pending ? 'Saving…' : 'Save call'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === 'note'} onOpenChange={close}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add note</DialogTitle>
            <DialogDescription>Visible to the sales team on this lead’s timeline.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            action={(fd) =>
              runAction(() => addNoteAction({ leadId, note: String(fd.get('note') ?? '') }), 'Note added')
            }
          >
            <div>
              <FieldLabel htmlFor="lead-note">Note</FieldLabel>
              <textarea id="lead-note" name="note" required maxLength={1000} className={textareaClass} />
            </div>
            <DialogFooter>
              <Button type="submit" className="h-11" disabled={pending}>
                {pending ? 'Saving…' : 'Save note'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={panel === 'task'} onOpenChange={close}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create task</DialogTitle>
            <DialogDescription>Assigned to you. It also becomes this lead’s next action.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            action={(fd) =>
              runAction(
                () =>
                  createTaskAction({
                    leadId,
                    title: String(fd.get('title') ?? ''),
                    dueAt: String(fd.get('due') ?? ''),
                  }),
                'Task created',
              )
            }
          >
            <div>
              <FieldLabel htmlFor="task-title">Task</FieldLabel>
              <input
                id="task-title"
                name="title"
                required
                minLength={2}
                maxLength={140}
                className={inputClass}
                placeholder="Call back about booking"
              />
            </div>
            <div>
              <FieldLabel htmlFor="task-due">Due (IST)</FieldLabel>
              <input
                id="task-due"
                name="due"
                type="datetime-local"
                required
                defaultValue={defaultDue}
                className={inputClass}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="h-11" disabled={pending}>
                {pending ? 'Saving…' : 'Create task'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {panel === 'lost' ? (
        <LostDialog
          leadName={leadName}
          open
          pending={pending}
          onOpenChange={close}
          onConfirm={(reason) =>
            runAction(() => moveLeadStageAction({ leadId, stage: 'lost', reason }), `${leadName} marked lost`)
          }
        />
      ) : null}
    </>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  tone,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'danger';
  title?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'h-12 justify-start gap-2 bg-card px-3 text-left whitespace-normal',
        tone === 'danger' && 'text-danger hover:text-danger',
      )}
    >
      <span aria-hidden className="[&_svg]:size-4">
        {icon}
      </span>
      {label}
    </Button>
  );
}

function BookDialog({
  open,
  onOpenChange,
  leadName,
  slots,
  holdMinutes,
  holdFromSetting,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  leadName: string;
  slots: SlotDay[];
  holdMinutes: number;
  holdFromSetting: boolean;
  pending: boolean;
  onConfirm: (iso: string) => void;
}) {
  const [day, setDay] = useState(slots[0]?.date ?? '');
  const [slot, setSlot] = useState<string | null>(null);
  const current = slots.find((d) => d.date === day) ?? slots[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Book on behalf of {leadName}</DialogTitle>
          <DialogDescription>
            We hold the slot and send a WhatsApp link where the customer confirms age (18+), gives consent and
            pays ₹500.
          </DialogDescription>
        </DialogHeader>
        {slots.length === 0 ? (
          <p className="rounded-md bg-mist px-3 py-4 text-sm text-body">
            No open slots in the booking window. Ask the admin to open more availability.
          </p>
        ) : (
          <div className="space-y-4">
            <div role="tablist" aria-label="Day" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {slots.map((d) => (
                <button
                  key={d.date}
                  role="tab"
                  type="button"
                  aria-selected={current?.date === d.date}
                  onClick={() => {
                    setDay(d.date);
                    setSlot(null);
                  }}
                  className={cn(
                    'h-11 shrink-0 rounded-md border px-3 text-sm font-medium',
                    current?.date === d.date
                      ? 'border-obsidian bg-obsidian text-on-dark'
                      : 'border-line bg-card text-ink hover:bg-mist',
                  )}
                >
                  {d.label}
                  <span className="ml-1.5 text-[12px] opacity-75">{d.slots.length} left</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Time">
              {current?.slots.map((s) => (
                <button
                  key={s.iso}
                  type="button"
                  role="radio"
                  aria-checked={slot === s.iso}
                  onClick={() => setSlot(s.iso)}
                  className={cn(
                    'price h-11 rounded-md border text-sm',
                    slot === s.iso
                      ? 'border-obsidian bg-obsidian text-on-dark'
                      : 'border-line bg-card text-ink hover:bg-mist',
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="rounded-md bg-info-bg px-3 py-2 text-[13px] text-info">
              {holdFromSetting
                ? `Sales holds last ${holdMinutes} min (consult.sales_hold_minutes).`
                : `Demo: this hold lasts ${holdMinutes} min (consult.hold_minutes). In production sales holds use consult.sales_hold_minutes.`}
            </p>
          </div>
        )}
        <DialogFooter>
          <Button
            className="h-11"
            disabled={!slot || pending}
            onClick={() => (slot ? onConfirm(slot) : undefined)}
          >
            {pending ? 'Holding…' : 'Hold slot and send pay link'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** FR-M7-7 reassign. */
export function OwnerSelect({
  leadId,
  ownerId,
  reps,
}: {
  leadId: string;
  ownerId: string | null;
  reps: { id: string; name: string }[];
}) {
  const [pending, start] = useTransition();
  return (
    <div className="w-48">
      <label htmlFor="lead-owner" className="sr-only">
        Owner
      </label>
      <NativeSelect
        id="lead-owner"
        value={ownerId ?? ''}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          const name = reps.find((r) => r.id === next)?.name ?? '';
          start(async () => {
            const res = await reassignLeadAction({ leadId, ownerId: next });
            if (res.ok) toast.success(`Reassigned to ${name}`);
            else toast.error(res.error.message);
          });
        }}
      >
        {ownerId === null ? <option value="">Unassigned</option> : null}
        {reps.map((r) => (
          <option key={r.id} value={r.id}>
            Owner: {r.name}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

/** Manual stage change (first five stages + Lost) from the lead header. */
export function StageSelect({
  leadId,
  stage,
  options,
}: {
  leadId: string;
  stage: LeadStage;
  options: { stage: LeadStage; label: string }[];
}) {
  const [pending, start] = useTransition();
  if (!MANUAL_STAGE_SET.has(stage)) return null;
  return (
    <div className="w-56">
      <label htmlFor="lead-stage" className="sr-only">
        Move to stage
      </label>
      <NativeSelect
        id="lead-stage"
        value={stage}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as LeadStage;
          if (next === 'lost') {
            toast('Use Mark lost to add a reason');
            return;
          }
          start(async () => {
            const res = await moveLeadStageAction({ leadId, stage: next });
            if (res.ok) toast.success(`Moved to ${options.find((o) => o.stage === next)?.label ?? next}`);
            else toast.error(res.error.message);
          });
        }}
      >
        {options
          .filter((o) => MANUAL_STAGE_SET.has(o.stage) && o.stage !== 'lost')
          .map((o) => (
            <option key={o.stage} value={o.stage}>
              Stage: {o.label}
            </option>
          ))}
        {stage === 'lost' ? <option value="lost">Stage: Lost</option> : null}
      </NativeSelect>
    </div>
  );
}
