'use client';

import { Loader2, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { chooseMemberAction } from '@/app/sales/live-actions';
import { cn } from '@/lib/utils';

/** "Who is using this device?" — the team shares one login (ADR-36). Saved in a cookie per device. */
export function MemberPicker({ team, current }: { team: string[]; current: string | null }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  if (!team.length)
    return (
      <Link href="/sales/team" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-ink ring-1 ring-line hover:bg-mist">
        <UserRound className="size-4" aria-hidden />
        Add your team names
      </Link>
    );
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sales-member" className="hidden text-sm text-muted-foreground sm:inline">
        I am
      </label>
      <select
        id="sales-member"
        aria-label="I am"
        value={current ?? ''}
        disabled={pending}
        onChange={(e) => {
          const name = e.target.value;
          setError(null);
          startTransition(async () => {
            const res = await chooseMemberAction(name);
            if (!res.ok) setError(res.error.message);
          });
        }}
        className="h-10 max-w-[10rem] rounded-lg border border-line bg-white px-3 text-sm text-ink"
      >
        <option value="" disabled>
          Choose your name
        </option>
        {team.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      {error ? (
        <span role="alert" className="text-sm text-danger">
          {error}
        </span>
      ) : null}
    </div>
  );
}

/** Full-page first step on a new device: big name buttons. */
export function WhoAreYou({ team }: { team: string[] }) {
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <section className="mx-auto max-w-lg rounded-[28px] bg-white p-6 ring-1 ring-line sm:p-8">
      <UserRound className="size-8 text-steel" aria-hidden />
      <h1 className="mt-4 font-display text-[30px] leading-tight font-medium text-ink">Who are you?</h1>
      <p className="mt-2 text-body">
        Pick your name once on this phone or laptop. Leads you take, calls you log and notes you write will show your
        name.
      </p>
      <ul className="mt-6 grid gap-2">
        {team.map((n) => (
          <li key={n}>
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setPicked(n);
                setError(null);
                startTransition(async () => {
                  const res = await chooseMemberAction(n);
                  if (!res.ok) setError(res.error.message);
                });
              }}
              className={cn(
                'flex min-h-14 w-full items-center justify-between rounded-2xl px-5 text-left text-[17px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-mist disabled:opacity-70',
                picked === n && 'bg-mist',
              )}
            >
              {n}
              {pending && picked === n ? <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
            </button>
          </li>
        ))}
      </ul>
      {error ? (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <p className="mt-6 text-[13px] text-muted-foreground">
        Name missing?{' '}
        <Link href="/sales/team" className="underline underline-offset-2">
          Edit the team list
        </Link>
        .
      </p>
    </section>
  );
}
