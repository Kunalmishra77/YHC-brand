'use client';

import { Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { addNoteAction, claimLeadAction, setStageAction } from '@/app/sales/live-actions';
import type { Result } from '@/lib/result';

/* Lead actions on the real sales portal (ADR-36): take / release, stage, notes and call logs. */

function useAction() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const go = (fn: () => Promise<Result<null>>, after?: () => void) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error.message);
      else after?.();
    });
  };
  return { error, pending, go };
}

const BTN =
  'inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3.5 text-sm font-medium ring-1 ring-line transition-colors hover:bg-mist disabled:opacity-60';

export function ClaimControl({ id, owner, me }: { id: string; owner: string | null; me: string | null }) {
  const { error, pending, go } = useAction();
  return (
    <div>
      {owner ? (
        <p className="text-sm text-ink">
          Owner: <span className="font-semibold">{owner}</span>
          {owner === me ? ' (you)' : ''}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Nobody has taken this lead yet.</p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {owner !== me ? (
          <button type="button" disabled={pending} className={`${BTN} bg-obsidian text-pearl ring-obsidian hover:bg-obsidian/90`} onClick={() => go(() => claimLeadAction({ id }))}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {owner ? 'Take this lead instead' : 'Take this lead'}
          </button>
        ) : null}
        {owner ? (
          <button type="button" disabled={pending} className={BTN} onClick={() => go(() => claimLeadAction({ id, release: true }))}>
            Release
          </button>
        ) : null}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function StageControl({ id, stage }: { id: string; stage: string }) {
  const { error, pending, go } = useAction();
  const [lostOpen, setLostOpen] = useState(false);
  const [reason, setReason] = useState('');
  const options: { stage: 'contacted' | 'interested' | 'product_purchased'; label: string }[] = [
    { stage: 'contacted', label: 'Contacted' },
    { stage: 'interested', label: 'Interested' },
    { stage: 'product_purchased', label: 'Sold' },
  ];
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.stage}
            type="button"
            disabled={pending || stage === o.stage}
            aria-pressed={stage === o.stage}
            className={`${BTN} ${stage === o.stage ? 'bg-mist font-semibold' : ''}`}
            onClick={() => go(() => setStageAction({ id, stage: o.stage }))}
          >
            {o.label}
          </button>
        ))}
        <button type="button" disabled={pending || stage === 'lost'} className={`${BTN} text-danger`} onClick={() => setLostOpen((v) => !v)}>
          Lost
        </button>
      </div>
      {lostOpen ? (
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            go(() => setStageAction({ id, stage: 'lost', reason }), () => setLostOpen(false));
          }}
        >
          <label htmlFor={`lost-${id}`} className="sr-only">
            Why was this lead lost?
          </label>
          <input
            id={`lost-${id}`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason, e.g. not interested, wrong number"
            className="h-10 flex-1 rounded-lg border border-line bg-white px-3 text-sm"
            maxLength={300}
          />
          <button type="submit" disabled={pending || reason.trim().length < 2} className={BTN}>
            Mark as lost
          </button>
        </form>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function NoteForm({ id }: { id: string }) {
  const { error, pending, go } = useAction();
  const [body, setBody] = useState('');
  const [kind, setKind] = useState<'call' | 'note'>('call');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(() => addNoteAction({ id, kind, body }), () => setBody(''));
      }}
    >
      <div className="flex gap-2" role="radiogroup" aria-label="Type">
        {(['call', 'note'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            onClick={() => setKind(k)}
            className={`${BTN} ${kind === k ? 'bg-mist font-semibold' : ''}`}
          >
            {k === 'call' ? 'Call log' : 'Note'}
          </button>
        ))}
      </div>
      <label htmlFor={`note-${id}`} className="sr-only">
        {kind === 'call' ? 'What happened on the call?' : 'Note'}
      </label>
      <textarea
        id={`note-${id}`}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder={kind === 'call' ? 'What happened on the call? e.g. No answer, call back at 6 pm' : 'Write a note'}
        className="mt-2 w-full rounded-lg border border-line bg-white p-3 text-sm"
      />
      <div className="mt-2 flex items-center gap-3">
        <button type="submit" disabled={pending || !body.trim()} className={`${BTN} bg-obsidian text-pearl ring-obsidian hover:bg-obsidian/90`}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Save
        </button>
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
