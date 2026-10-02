'use client';

import { LockKeyhole } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PhoneVerify } from './phone-verify';

/**
 * Shown when a page belongs to a customer who isn't signed in on this device. Verifying the mobile
 * number signs in and re-renders; the server then checks the record really belongs to that customer.
 */
export function SignInPrompt({
  title,
  body,
  tone = 'light',
}: {
  title: string;
  body: string;
  tone?: 'light' | 'dark';
}) {
  const router = useRouter();
  const dark = tone === 'dark';
  return (
    <div
      className={
        dark
          ? 'mx-auto max-w-md rounded-xl border border-line-dark bg-ink-2 p-6 text-on-dark'
          : 'mx-auto max-w-md rounded-xl border border-line bg-card p-6 shadow-card'
      }
    >
      <LockKeyhole className={dark ? 'size-5 text-platinum' : 'size-5 text-steel'} aria-hidden />
      <h1 className={dark ? 'mt-3 text-xl font-medium text-on-dark' : 'mt-3 text-xl font-medium text-ink'}>
        {title}
      </h1>
      <p className={dark ? 'mt-1 text-sm text-on-dark-muted' : 'mt-1 text-sm text-body'}>{body}</p>
      <div className={dark ? 'mt-5 rounded-lg bg-pearl p-4 text-body' : 'mt-5'}>
        <PhoneVerify onVerified={() => router.refresh()} />
      </div>
    </div>
  );
}
