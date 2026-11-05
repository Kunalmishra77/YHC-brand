'use client';

import { Loader2, LogIn } from 'lucide-react';
import { useId, useState, useTransition } from 'react';
import { staffSignInAction } from '@/app/auth/actions';

export function StaffLoginForm({ next }: { next?: string }) {
  const uid = useId();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          const res = await staffSignInAction({
            email: String(form.get('email') ?? ''),
            password: String(form.get('password') ?? ''),
            next,
          });
          if (res && !res.ok) setError(res.error.message);
        });
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor={`${uid}-email`} className="mb-1.5 block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id={`${uid}-email`}
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/15"
        />
      </div>
      <div>
        <label htmlFor={`${uid}-password`} className="mb-1.5 block text-sm font-medium text-ink">
          Password
        </label>
        <input
          id={`${uid}-password`}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink outline-none focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/15"
        />
      </div>
      <p aria-live="assertive" className="min-h-5 text-sm text-danger">
        {error}
      </p>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-obsidian text-[15px] font-semibold text-pearl hover:opacity-95 disabled:opacity-70"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
        ) : (
          <LogIn className="size-4" aria-hidden />
        )}
        Sign in
      </button>
    </form>
  );
}
