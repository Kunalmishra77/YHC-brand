'use client';

import { Loader2, Plus, X } from 'lucide-react';
import { useState, useTransition } from 'react';
import { saveTeamAction } from '@/app/sales/live-actions';

/** Edit the names of the people who share the sales login (ADR-36). */
export function TeamEditor({ initial }: { initial: string[] }) {
  const [names, setNames] = useState<string[]>(initial.length ? initial : ['']);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <form
      className="max-w-md space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        startTransition(async () => {
          const res = await saveTeamAction(names);
          setMsg(res.ok ? { ok: true, text: 'Saved.' } : { ok: false, text: res.error.message });
        });
      }}
    >
      {names.map((n, i) => (
        <div key={i} className="flex gap-2">
          <label htmlFor={`member-${i}`} className="sr-only">
            Team member {i + 1}
          </label>
          <input
            id={`member-${i}`}
            value={n}
            maxLength={60}
            onChange={(e) => setNames((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
            placeholder={`Name ${i + 1}`}
            className="h-11 flex-1 rounded-lg border border-line bg-white px-3 text-sm"
          />
          <button
            type="button"
            aria-label={`Remove ${n || `name ${i + 1}`}`}
            onClick={() => setNames((prev) => prev.filter((_, j) => j !== i))}
            className="flex size-11 items-center justify-center rounded-lg ring-1 ring-line hover:bg-mist"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setNames((prev) => [...prev, ''])}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm ring-1 ring-line hover:bg-mist"
        >
          <Plus className="size-4" aria-hidden />
          Add a name
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-obsidian px-4 text-sm font-semibold text-pearl disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          Save team
        </button>
      </div>
      {msg ? (
        <p role="status" className={msg.ok ? 'text-sm text-success' : 'text-sm text-danger'}>
          {msg.text}
        </p>
      ) : null}
    </form>
  );
}
