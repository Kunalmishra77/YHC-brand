'use client';

import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { useEffect, useId, useState, useTransition } from 'react';
import { signInSendAction, signInVerifyAction } from '@/app/(site)/start/actions';
import { OtpInput } from '@/components/booking/otp-input';
import { cn } from '@/lib/utils';

/**
 * Returning customers (ADR-36): email → 6-digit code → their account. No need to type the details
 * again. Shown inside the glass start form (homepage hero and /start).
 */
export function SignInPanel({ onBack }: { onBack: () => void }) {
  const uid = useId();
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const send = () => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await signInSendAction({ email });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setSentTo(res.data.sentTo);
      setResendIn(60);
    });
  };

  const verify = (value: string) => {
    if (value.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setError(null);
    startTransition(async () => {
      // On success the server redirects to the account; only failures come back here.
      const res = await signInVerifyAction({ email, code: value });
      if (res && !res.ok) setError(res.error.message);
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={sentTo ? () => setSentTo(null) : onBack}
        className="-ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm text-white/75 hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        {sentTo ? 'Change email' : 'Back'}
      </button>
      <h2 className="mt-1 font-display text-[28px] leading-[1.1] font-medium text-white">Sign in</h2>

      {!sentTo ? (
        <form
          className="mt-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <p className="text-sm text-white/75">Took the scan before? Enter the email you used and we send you a code.</p>
          <label htmlFor={`${uid}-email`} className="mt-4 mb-1.5 block text-[13px] font-medium text-white/85">
            Email
          </label>
          <input
            id={`${uid}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            aria-invalid={error ? true : undefined}
            className={cn(
              'h-12 w-full min-w-0 rounded-xl border bg-white/5 px-3.5 text-[15px] text-white outline-none',
              'focus-visible:border-white/60 focus-visible:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/25',
              error ? 'border-[#ffb4a8]' : 'border-white/20',
            )}
          />
          <p aria-live="assertive" className="mt-2 min-h-5 text-sm text-[#ffb4a8]">
            {error}
          </p>
          <button
            type="submit"
            disabled={pending || !email.trim()}
            className="bg-silver mt-1 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-obsidian transition-opacity hover:opacity-95 disabled:opacity-70"
          >
            {pending ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
            Email me a code
          </button>
        </form>
      ) : (
        <div className="mt-3">
          <p id={`${uid}-hint`} className="flex items-start gap-2 text-sm text-white/75">
            <Mail className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              We emailed a 6-digit code to <span className="text-white">{sentTo}</span>. Check your spam folder if
              you can&apos;t see it.
            </span>
          </p>
          <div className="mt-5">
            <OtpInput
              value={code}
              onChange={(v) => {
                setCode(v);
                setError(null);
              }}
              onComplete={verify}
              invalid={Boolean(error)}
              disabled={pending}
              describedBy={`${uid}-hint`}
            />
          </div>
          <p aria-live="assertive" className="mt-2 min-h-5 text-sm text-[#ffb4a8]">
            {error}
          </p>
          <button
            type="button"
            disabled={pending}
            onClick={() => verify(code)}
            className="bg-silver mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-obsidian transition-opacity hover:opacity-95 disabled:opacity-70"
          >
            {pending ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
            Sign in
          </button>
          <p aria-live="polite" className="mt-3 text-center text-[13px] text-white/70">
            {notice ??
              (resendIn > 0 ? (
                `You can ask for a new code in ${resendIn}s`
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCode('');
                    send();
                    setNotice('A new code is on its way.');
                  }}
                  disabled={pending}
                  className="underline underline-offset-4"
                >
                  Send a new code
                </button>
              ))}
          </p>
        </div>
      )}
    </div>
  );
}
