'use client';

import { CalendarClock, Check, Hand, Loader2, MessageCircle, Phone, UserRoundPlus, X } from 'lucide-react';
import { useState, useTransition } from 'react';
import {
  addNoteAction,
  assignLeadAction,
  claimLeadAction,
  logCallAction,
  logWhatsAppAction,
  setFollowUpAction,
  setStageAction,
} from '@/app/sales/live-actions';
import type { Result } from '@/lib/result';
import {
  CALL_RESULTS,
  type CallResult,
  LOST_REASONS,
  SOLD_PRODUCTS,
  WHATSAPP_TEMPLATES,
  quickFollowUps,
  whatsappLink,
  whatsappText,
} from '@/lib/sales/playbook';
import { cn } from '@/lib/utils';

/* Lead actions on the real sales portal (ADR-36, ADR-37). Every button saves to the lead's history. */

function useAction() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const go = <T,>(fn: () => Promise<Result<T>>, after?: (data: T) => void) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error.message);
      else after?.(res.data);
    });
  };
  return { error, pending, go };
}

export const BTN =
  'inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-3.5 text-sm font-medium ring-1 ring-line transition-colors hover:bg-mist disabled:opacity-60';
const PRIMARY = 'bg-obsidian text-pearl ring-obsidian hover:bg-obsidian/90';

function ErrorLine({ error }: { error: string | null }) {
  return error ? (
    <p role="alert" className="mt-2 text-sm text-danger">
      {error}
    </p>
  ) : null;
}

function Spinner({ on }: { on: boolean }) {
  return on ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null;
}

const istFmt = (d: Date) =>
  new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);

// ---------------------------------------------------------------------------------------------
// Ownership

/** One-tap "Take" for list rows. */
export function TakeButton({ id, className }: { id: string; className?: string }) {
  const { error, pending, go } = useAction();
  return (
    <div className={className}>
      <button type="button" disabled={pending} onClick={() => go(() => claimLeadAction({ id }))} className={cn(BTN, PRIMARY, 'w-full')}>
        {pending ? <Spinner on /> : <Hand className="size-4" aria-hidden />}
        Take
      </button>
      <ErrorLine error={error} />
    </div>
  );
}

export function OwnerPanel({
  id,
  owner,
  me,
  team,
}: {
  id: string;
  owner: string | null;
  me: string | null;
  team: string[];
}) {
  const { error, pending, go } = useAction();
  const [giveTo, setGiveTo] = useState('');
  const others = team.filter((n) => n !== owner);
  return (
    <div>
      {owner ? (
        <p className="text-sm text-ink">
          <span className="font-semibold">{owner}</span>
          {owner === me ? ' (you)' : ''} owns this lead.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Nobody owns this lead yet.</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {owner !== me ? (
          <button type="button" disabled={pending} className={cn(BTN, PRIMARY)} onClick={() => go(() => claimLeadAction({ id }))}>
            {pending ? <Spinner on /> : <Hand className="size-4" aria-hidden />}
            {owner ? 'Take it over' : 'Take this lead'}
          </button>
        ) : null}
        {owner ? (
          <button type="button" disabled={pending} className={BTN} onClick={() => go(() => assignLeadAction({ id, to: null }))}>
            Release
          </button>
        ) : null}
      </div>
      {others.length ? (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (giveTo) go(() => assignLeadAction({ id, to: giveTo }), () => setGiveTo(''));
          }}
        >
          <label htmlFor={`give-${id}`} className="sr-only">
            Give this lead to
          </label>
          <select
            id={`give-${id}`}
            value={giveTo}
            onChange={(e) => setGiveTo(e.target.value)}
            className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm text-ink"
          >
            <option value="">Give to a teammate…</option>
            {others.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button type="submit" disabled={pending || !giveTo} className={BTN}>
            <UserRoundPlus className="size-4" aria-hidden />
            Give
          </button>
        </form>
      ) : null}
      <ErrorLine error={error} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Calls

export function CallPanel({ id, phone, prettyPhone }: { id: string; phone: string; prettyPhone: string }) {
  const { error, pending, go } = useAction();
  const [result, setResult] = useState<CallResult | null>(null);
  const [note, setNote] = useState('');
  const [saved, setSaved] = useState<string | null>(null);
  return (
    <div>
      <a href={`tel:${phone}`} className={cn(BTN, PRIMARY, 'h-12 w-full text-[15px] sm:w-auto sm:px-6')}>
        <Phone className="size-4" aria-hidden />
        Call {prettyPhone}
      </a>
      <p className="mt-4 text-sm font-medium text-ink">After the call, how did it go?</p>
      <div role="radiogroup" aria-label="Call result" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CALL_RESULTS.map((r) => (
          <button
            key={r.id}
            type="button"
            role="radio"
            aria-checked={result === r.id}
            onClick={() => {
              setResult(r.id);
              setSaved(null);
            }}
            className={cn(BTN, 'px-2 text-[13px] sm:text-sm', result === r.id && 'bg-obsidian text-pearl ring-obsidian hover:bg-obsidian/90')}
          >
            {r.label}
          </button>
        ))}
      </div>
      {result ? (
        <form
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            go(
              () => logCallAction({ id, result, note }),
              (data) => {
                setSaved(
                  data.nextTry
                    ? `Saved. Next try booked for ${istFmt(new Date(data.nextTry))}.`
                    : result === 'wrong_number'
                      ? 'Saved. If the number is wrong, mark the lead as Lost below.'
                      : 'Saved to the history.',
                );
                setResult(null);
                setNote('');
              },
            );
          }}
        >
          <label htmlFor={`call-note-${id}`} className="sr-only">
            Short note (optional)
          </label>
          <textarea
            id={`call-note-${id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Short note (optional) — e.g. wants to talk to family first"
            className="w-full rounded-xl border border-line bg-white p-3 text-sm"
          />
          <button type="submit" disabled={pending} className={cn(BTN, PRIMARY, 'mt-2')}>
            <Spinner on={pending} />
            Save call
          </button>
        </form>
      ) : null}
      {saved ? (
        <p role="status" className="mt-3 flex items-start gap-2 rounded-xl bg-success-bg p-3 text-sm text-ink">
          <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
          {saved}
        </p>
      ) : null}
      <ErrorLine error={error} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Follow-up

export function FollowUpPanel({ id, nextActionAt }: { id: string; nextActionAt: string | null }) {
  const { error, pending, go } = useAction();
  const [custom, setCustom] = useState('');
  const save = (at: Date | null) => go(() => setFollowUpAction({ id, at: at ? at.toISOString() : null }), () => setCustom(''));
  return (
    <div>
      <p className="text-sm text-ink">
        {nextActionAt ? (
          <>
            Next call: <span className="font-semibold">{istFmt(new Date(nextActionAt))}</span>
          </>
        ) : (
          <span className="text-muted-foreground">No follow-up set.</span>
        )}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {/* Times are worked out on click, so they are always from "now". */}
        {quickFollowUps(new Date(0)).map((q) => (
          <button
            key={q.id}
            type="button"
            disabled={pending}
            className={BTN}
            onClick={() => save(quickFollowUps(new Date()).find((x) => x.id === q.id)?.at ?? null)}
          >
            {q.label}
          </button>
        ))}
      </div>
      <form
        className="mt-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (custom) save(new Date(custom));
        }}
      >
        <label htmlFor={`fu-${id}`} className="sr-only">
          Pick a date and time
        </label>
        <input
          id={`fu-${id}`}
          type="datetime-local"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm"
        />
        <button type="submit" disabled={pending || !custom} className={BTN}>
          <CalendarClock className="size-4" aria-hidden />
          Set
        </button>
        {nextActionAt ? (
          <button type="button" disabled={pending} className={BTN} onClick={() => save(null)}>
            <X className="size-4" aria-hidden />
            Clear
          </button>
        ) : null}
      </form>
      <ErrorLine error={error} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Stage

export function StageControl({ id, stage }: { id: string; stage: string }) {
  const { error, pending, go } = useAction();
  const [open, setOpen] = useState<'sold' | 'lost' | null>(null);
  const [choice, setChoice] = useState('');
  const [note, setNote] = useState('');
  const simple: { stage: 'contacted' | 'interested'; label: string }[] = [
    { stage: 'contacted', label: 'Contacted' },
    { stage: 'interested', label: 'Interested' },
  ];
  const close = () => {
    setOpen(null);
    setChoice('');
    setNote('');
  };
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {simple.map((o) => (
          <button
            key={o.stage}
            type="button"
            disabled={pending || stage === o.stage}
            aria-pressed={stage === o.stage}
            className={cn(BTN, stage === o.stage && 'bg-mist font-semibold')}
            onClick={() => go(() => setStageAction({ id, stage: o.stage }))}
          >
            {o.label}
          </button>
        ))}
        <button
          type="button"
          disabled={pending || stage === 'product_purchased'}
          aria-expanded={open === 'sold'}
          className={cn(BTN, 'text-success', stage === 'product_purchased' && 'bg-success-bg font-semibold')}
          onClick={() => setOpen(open === 'sold' ? null : 'sold')}
        >
          Sold
        </button>
        <button
          type="button"
          disabled={pending || stage === 'lost'}
          aria-expanded={open === 'lost'}
          className={cn(BTN, 'text-danger', stage === 'lost' && 'bg-danger-bg font-semibold')}
          onClick={() => setOpen(open === 'lost' ? null : 'lost')}
        >
          Lost
        </button>
      </div>
      {open ? (
        <form
          className="mt-3 rounded-xl bg-mist p-3"
          onSubmit={(e) => {
            e.preventDefault();
            const reason = [choice, note.trim()].filter(Boolean).join(' — ');
            go(() => setStageAction({ id, stage: open === 'sold' ? 'product_purchased' : 'lost', reason }), close);
          }}
        >
          <label htmlFor={`stage-choice-${id}`} className="text-sm font-medium text-ink">
            {open === 'sold' ? 'What did they buy?' : 'Why was this lead lost?'}
          </label>
          <select
            id={`stage-choice-${id}`}
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink"
          >
            <option value="">Choose…</option>
            {(open === 'sold' ? SOLD_PRODUCTS : LOST_REASONS).map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <label htmlFor={`stage-note-${id}`} className="sr-only">
            Note
          </label>
          <input
            id={`stage-note-${id}`}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            placeholder={open === 'sold' ? 'Order details (optional)' : 'More detail (optional)'}
            className="mt-2 h-11 w-full rounded-xl border border-line bg-white px-3 text-sm"
          />
          <div className="mt-2 flex gap-2">
            <button type="submit" disabled={pending || !choice} className={cn(BTN, PRIMARY)}>
              <Spinner on={pending} />
              {open === 'sold' ? 'Mark as sold' : 'Mark as lost'}
            </button>
            <button type="button" onClick={close} className={BTN}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}
      <ErrorLine error={error} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// WhatsApp

export function WhatsAppPanel({
  id,
  phone,
  name,
  member,
  suggest,
}: {
  id: string;
  phone: string;
  name: string;
  member: string | null;
  suggest: string | null;
}) {
  const { error, go } = useAction();
  return (
    <div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {WHATSAPP_TEMPLATES.map((t) => {
          const text = whatsappText(t.id, { name, member });
          return (
            <li key={t.id}>
              <a
                href={whatsappLink(phone, text)}
                target="_blank"
                rel="noreferrer"
                onClick={() => go(() => logWhatsAppAction({ id, template: t.id }))}
                className={cn(
                  'flex h-full flex-col rounded-xl p-3 text-left ring-1 ring-line transition-colors hover:bg-mist',
                  suggest === t.id && 'ring-2 ring-success',
                )}
              >
                <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <MessageCircle className="size-4 text-success" aria-hidden />
                  {t.label}
                  {suggest === t.id ? <span className="ml-auto text-[12px] font-medium text-success">Suggested</span> : null}
                </span>
                <span className="mt-1 line-clamp-3 text-[13px] text-muted-foreground">{text}</span>
              </a>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[13px] text-muted-foreground">
        Opens your WhatsApp with the message ready. Check it, then press send.
      </p>
      <ErrorLine error={error} />
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Notes

export function NoteForm({ id }: { id: string }) {
  const { error, pending, go } = useAction();
  const [body, setBody] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(() => addNoteAction({ id, body }), () => setBody(''));
      }}
    >
      <label htmlFor={`note-${id}`} className="sr-only">
        Note
      </label>
      <textarea
        id={`note-${id}`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="Anything the team should know — e.g. prefers Hindi, call after 6 pm"
        className="w-full rounded-xl border border-line bg-white p-3 text-sm"
      />
      <div className="mt-2 flex items-center gap-3">
        <button type="submit" disabled={pending || !body.trim()} className={cn(BTN, PRIMARY)}>
          <Spinner on={pending} />
          Save note
        </button>
        <ErrorLine error={error} />
      </div>
    </form>
  );
}
