'use client';

import { UserRound } from 'lucide-react';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { chooseMemberAction } from '@/app/sales/live-actions';

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
      <label htmlFor="sales-member" className="text-sm text-muted-foreground">
        I am
      </label>
      <select
        id="sales-member"
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
        className="h-10 rounded-lg border border-line bg-white px-3 text-sm text-ink"
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
