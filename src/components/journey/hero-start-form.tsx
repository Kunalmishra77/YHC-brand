'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Loader2, Mail, ScanFace, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { sendCodeAction, verifyCodeAction } from '@/app/(site)/start/actions';
import { OtpInput } from '@/components/booking/otp-input';
import { SignInPanel } from '@/components/journey/sign-in-panel';
import { Checkbox } from '@/components/ui/checkbox';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { type StartScanForm, type StartScanFormInput, startScanFormSchema } from '@/lib/validation/scan';

/**
 * "Free scalp scan" start form (homepage hero and /start). CONTRACT — keep the export name and props:
 *   <HeroStartForm className? signIn? />  (signIn: open on the returning-customer sign-in)
 * Flow (ADR-36): name, mobile, email, age → a 6-digit code by email → the server signs the customer in,
 * creates the lead and redirects to /start/scan.
 */
export function HeroStartForm({ className, signIn = false }: { className?: string; signIn?: boolean }) {
  const uid = useId();
  const [otpFor, setOtpFor] = useState<{ values: StartScanForm; sentTo: string } | null>(null);
  const [signingIn, setSigningIn] = useState(signIn);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StartScanFormInput, unknown, StartScanForm>({
    resolver: zodResolver(startScanFormSchema),
    defaultValues: { name: '', mobile: '', email: '', age: '' as unknown as number, consent: false },
  });

  const sendCode = (values: StartScanForm) => {
    setServerError(null);
    startTransition(async () => {
      const res = await sendCodeAction(values);
      if (!res.ok) {
        setServerError(res.error.message);
        return;
      }
      track('details_submitted');
      setOtpFor({ values, sentTo: res.data.sentTo });
    });
  };

  return (
    <div
      className={cn(
        'w-full max-w-md rounded-[28px] bg-white/10 p-5 text-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] ring-1 ring-white/20 backdrop-blur-2xl sm:p-8',
        className,
      )}
    >
      {signingIn ? (
        <SignInPanel onBack={() => setSigningIn(false)} />
      ) : otpFor ? (
        <OtpStep
          sentTo={otpFor.sentTo}
          values={otpFor.values}
          onBack={() => {
            setOtpFor(null);
            setServerError(null);
          }}
        />
      ) : (
        <form noValidate onSubmit={handleSubmit(sendCode)}>
          <div className="flex items-center gap-2 text-[13px] font-medium text-white/75">
            <ScanFace className="size-4" aria-hidden />
            Free scalp scan
          </div>
          <h2 className="mt-3 font-display text-[28px] leading-[1.1] font-medium text-balance text-white sm:text-[32px]">
            Check your hair for free
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-pretty text-white/75">
            Scan your scalp with your phone and see your result straight away. Our team then calls you.
          </p>

          <fieldset disabled={pending} className="mt-5 space-y-3">
            <GlassField id={`${uid}-name`} label="Your name" error={errors.name?.message}>
              <input
                id={`${uid}-name`}
                autoComplete="name"
                className={inputClass(Boolean(errors.name))}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={`${uid}-name-err`}
                {...register('name')}
              />
            </GlassField>

            {/* Mobile + age share a row; the email gets the full width (it is the longest value). */}
            <div className="grid grid-cols-[minmax(0,1fr)_6.5rem] gap-3">
              <GlassField id={`${uid}-mobile`} label="Mobile number" error={errors.mobile?.message}>
                <div className="flex">
                  <span className="inline-flex h-12 items-center rounded-l-xl border border-r-0 border-white/20 bg-white/5 px-3 text-[15px] text-white/80">
                    +91
                  </span>
                  <input
                    id={`${uid}-mobile`}
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={16}
                    className={cn(inputClass(Boolean(errors.mobile)), 'price rounded-l-none')}
                    aria-invalid={errors.mobile ? true : undefined}
                    aria-describedby={`${uid}-mobile-err`}
                    {...register('mobile')}
                  />
                </div>
              </GlassField>
              <GlassField id={`${uid}-age`} label="Age" error={errors.age?.message}>
                <input
                  id={`${uid}-age`}
                  type="number"
                  inputMode="numeric"
                  min={18}
                  max={100}
                  className={cn(inputClass(Boolean(errors.age)), 'price')}
                  aria-invalid={errors.age ? true : undefined}
                  aria-describedby={`${uid}-age-err`}
                  {...register('age')}
                />
              </GlassField>
            </div>

            <GlassField id={`${uid}-email`} label="Email (for your code)" error={errors.email?.message}>
              <input
                id={`${uid}-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
                className={inputClass(Boolean(errors.email))}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={`${uid}-email-err`}
                {...register('email')}
              />
            </GlassField>

            <Controller
              control={control}
              name="consent"
              render={({ field }) => (
                <div>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`${uid}-consent`}
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                      onBlur={field.onBlur}
                      aria-invalid={errors.consent ? true : undefined}
                      aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
                      className="relative mt-0.5 size-5 border-white/40 bg-white/5 after:absolute after:-inset-3 after:content-[''] data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-obsidian"
                    />
                    <label htmlFor={`${uid}-consent`} className="text-[13px] leading-snug text-white/75">
                      I agree to the{' '}
                      <Link href="/legal/privacy" className="py-1 text-white underline underline-offset-2">
                        privacy policy
                      </Link>{' '}
                      and to a call or WhatsApp from Your Hair Company about my scan.
                    </label>
                  </div>
                  {errors.consent ? (
                    <p
                      id={`${uid}-consent-err`}
                      role="alert"
                      className="mt-1 pl-8 text-[13px] text-[#ffb4a8]"
                    >
                      {errors.consent.message}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </fieldset>

          <p aria-live="assertive" className={cn('mt-3 text-sm text-[#ffb4a8]', !serverError && 'sr-only')}>
            {serverError}
          </p>

          <button
            type="submit"
            disabled={pending}
            className="bg-silver mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-obsidian shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-opacity hover:opacity-95 disabled:opacity-70"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            ) : null}
            Begin my free scalp scan
            {!pending ? <ArrowRight className="size-4" aria-hidden /> : null}
          </button>
          <p className="mt-3.5 text-center text-[12px] leading-snug text-balance text-white/60">
            <ShieldCheck className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />
            Free. Takes about 4 minutes. Your photos stay private.
          </p>
          <p className="mt-2 text-center text-[13px] text-white/75">
            Took the scan before?{' '}
            <button
              type="button"
              onClick={() => setSigningIn(true)}
              className="py-1.5 font-medium text-white underline underline-offset-4"
            >
              Sign in with your email
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

function readUtm(): Record<string, string> {
  try {
    const params = new URLSearchParams(window.location.search);
    const fresh = Object.fromEntries([...params].filter(([k]) => k.startsWith('utm_')));
    if (Object.keys(fresh).length) {
      sessionStorage.setItem('yhc.utm', JSON.stringify(fresh));
      return fresh;
    }
    const kept = sessionStorage.getItem('yhc.utm');
    return kept ? (JSON.parse(kept) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function OtpStep({ sentTo, values, onBack }: { sentTo: string; values: StartScanForm; onBack: () => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(60);
  const [pending, startTransition] = useTransition();
  const hintId = useId();

  useEffect(() => {
    document.getElementById(`${hintId}-title`)?.focus();
  }, [hintId]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const verify = (value: string) => {
    if (value.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setError(null);
    startTransition(async () => {
      // On success the server redirects to the scan; only failures come back here.
      const res = await verifyCodeAction({ ...values, code: value, utm: readUtm() });
      if (res && !res.ok) setError(res.error.message);
    });
  };

  const resend = () => {
    setError(null);
    setNotice(null);
    startTransition(async () => {
      const res = await sendCodeAction(values);
      if (!res.ok) setError(res.error.message);
      else {
        setNotice('A new code is on its way.');
        setResendIn(60);
      }
    });
  };

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm text-white/75 hover:text-white"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Change details
      </button>
      <h2
        id={`${hintId}-title`}
        tabIndex={-1}
        className="mt-1 font-display text-[28px] leading-[1.1] font-medium text-white outline-none"
      >
        Enter your code
      </h2>
      <p id={hintId} className="mt-2 flex items-start gap-2 text-sm text-white/75">
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
          describedBy={hintId}
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
        Confirm and start my scan
      </button>
      <p aria-live="polite" className="mt-3 text-center text-[13px] text-white/70">
        {notice ??
          (resendIn > 0 ? (
            `You can ask for a new code in ${resendIn}s`
          ) : (
            <button type="button" onClick={resend} disabled={pending} className="underline underline-offset-4">
              Send a new code
            </button>
          ))}
      </p>
    </div>
  );
}

function inputClass(invalid: boolean) {
  return cn(
    'h-12 w-full min-w-0 rounded-xl border bg-white/5 px-3.5 text-[15px] text-white outline-none placeholder:text-white/40',
    'transition-colors focus-visible:border-white/60 focus-visible:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/25',
    invalid ? 'border-[#ffb4a8]' : 'border-white/20',
  );
}

function GlassField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-white/85">
        {label}
      </label>
      {children}
      <p id={`${id}-err`} aria-live="polite" className="mt-1 min-h-0 text-[13px] text-[#ffb4a8]">
        {error}
      </p>
    </div>
  );
}
