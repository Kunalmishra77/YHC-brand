'use client';

import { Loader2, MessageCircle, Pencil } from 'lucide-react';
import { useEffect, useId, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { mobileSchema } from '@/lib/validation/booking';
import { sendOtpAction, verifyOtpAction } from '@/app/(site)/book/actions';
import { OtpInput } from './otp-input';
import type { SignedInView } from './types';

/**
 * Mobile + OTP (FR-M3-3, FR-M2-4). Demo: no message is sent — the code is shown on screen.
 * Verifying signs the customer in (demo cookie) and creates/links the customer + lead on the server.
 */
export function PhoneVerify({
  onVerified,
  intro,
}: {
  onVerified: (view: SignedInView) => void;
  intro?: React.ReactNode;
}) {
  const ids = useId();
  const [mobile, setMobile] = useState('');
  const [stage, setStage] = useState<'phone' | 'code'>('phone');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (resendIn <= 0) return;
    const id = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [resendIn]);

  const send = (via: 'whatsapp' | 'sms') => {
    const parsed = mobileSchema.safeParse(mobile);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Enter a 10-digit mobile number');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await sendOtpAction({ mobile: parsed.data, channel: via });
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setSentTo(res.data.sentTo);
      setChannel(res.data.channel);
      setDemoCode(res.data.demoCode);
      setResendIn(res.data.resendIn);
      setCode('');
      setStage('code');
    });
  };

  const verify = (value: string) => {
    if (!/^\d{6}$/.test(value)) {
      setError('Enter the 6-digit code');
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await verifyOtpAction({ mobile, code: value });
      if (!res.ok) {
        setError(res.error.message);
        setCode('');
        return;
      }
      onVerified(res.data);
    });
  };

  if (stage === 'phone') {
    return (
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          send('whatsapp');
        }}
        className="space-y-4"
      >
        {intro}
        <div className="space-y-2">
          <Label htmlFor={`${ids}-mobile`} className="text-sm font-medium text-ink">
            Mobile number
          </Label>
          <div className="flex h-12 overflow-hidden rounded-md border border-line bg-card focus-within:border-brand focus-within:ring-[3px] focus-within:ring-brand/25">
            <span className="flex items-center border-r border-line bg-mist px-3 text-base text-ink">
              +91
            </span>
            <input
              id={`${ids}-mobile`}
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              maxLength={14}
              value={mobile}
              onChange={(e) => setMobile(e.currentTarget.value.replace(/[^\d\s]/g, ''))}
              aria-invalid={error ? true : undefined}
              aria-describedby={`${ids}-mobile-help ${ids}-err`}
              className="price min-w-0 flex-1 bg-transparent px-3 text-base tracking-wide text-ink outline-none"
            />
          </div>
          <p id={`${ids}-mobile-help`} className="text-sm text-muted-foreground">
            We&apos;ll send a 6-digit code on WhatsApp. Your number is only used for this consultation and
            your order updates.
          </p>
        </div>
        <p id={`${ids}-err`} aria-live="polite" className="min-h-5 text-sm text-danger">
          {error}
        </p>
        <Button type="submit" disabled={pending} className="h-12 w-full text-base sm:w-auto sm:px-8">
          {pending ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : null}
          Send code
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-body">
        <MessageCircle className="size-4 text-steel" aria-hidden />
        <span>
          Code sent by {channel === 'sms' ? 'SMS' : 'WhatsApp'} to{' '}
          <span className="price font-medium text-ink">{sentTo}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setStage('phone');
            setError(null);
          }}
          className="inline-flex min-h-11 items-center gap-1 px-1 font-medium text-brand underline-offset-4 hover:underline"
        >
          <Pencil className="size-3.5" aria-hidden />
          Change number
        </button>
      </div>

      {demoCode ? (
        <p className="rounded-md border border-dashed border-warning/50 bg-warning-bg px-3 py-2 text-sm text-warning">
          Demo — no message is sent. Demo code: <span className="price font-semibold">{demoCode}</span>
        </p>
      ) : null}

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          verify(code);
        }}
        className="space-y-3"
      >
        <Label className="text-sm font-medium text-ink" id={`${ids}-code-label`}>
          Enter the 6-digit code
        </Label>
        <OtpInput
          value={code}
          onChange={setCode}
          onComplete={verify}
          invalid={Boolean(error)}
          disabled={pending}
          describedBy={`${ids}-err2`}
        />
        <p id={`${ids}-err2`} aria-live="polite" className="min-h-5 text-sm text-danger">
          {error}
        </p>
        <Button type="submit" disabled={pending} className="h-12 w-full text-base sm:w-auto sm:px-8">
          {pending ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : null}
          Verify and continue
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-x-4 text-sm">
        {resendIn > 0 ? (
          <p className="price min-h-11 py-3 text-muted-foreground" aria-live="off">
            Resend code in 0:{String(resendIn).padStart(2, '0')}
          </p>
        ) : (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => send('whatsapp')}
              className="min-h-11 font-medium text-brand underline-offset-4 hover:underline"
            >
              Resend on WhatsApp
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => send('sms')}
              className="min-h-11 font-medium text-brand underline-offset-4 hover:underline"
            >
              Send by SMS instead
            </button>
          </>
        )}
      </div>
    </div>
  );
}
