'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Loader2, ScanFace, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useId, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { startJourneyAction } from '@/app/(site)/start/actions';
import { OtpInput } from '@/components/booking/otp-input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { startJourneySchema, type StartJourney, type StartJourneyInput } from '@/lib/validation/journey';

/**
 * Glass "Start your assessment" form shown in the homepage hero (ADR-26, step 1: basic details).
 * CONTRACT shared by two workstreams — keep the export name and props stable:
 *   <HeroStartForm className? />  — collects name, mobile, address and starts the journey.
 * Flow: details → demo OTP (123456) inside the panel → server action signs in + redirects to /start/scan.
 */
export function HeroStartForm({ className }: { className?: string }) {
  const uid = useId();
  const [otpFor, setOtpFor] = useState<{ values: StartJourney; sentTo: string; demoCode: string } | null>(
    null,
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<StartJourneyInput, unknown, StartJourney>({
    resolver: zodResolver(startJourneySchema),
    defaultValues: { name: '', mobile: '', address: '', pincode: '', consent: false },
  });

  const sendCode = (values: StartJourney) => {
    setServerError(null);
    startTransition(async () => {
      const res = await startJourneyAction(values);
      if (!res.ok) {
        setServerError(res.error.message);
        return;
      }
      setOtpFor({ values, sentTo: res.data.sentTo, demoCode: res.data.demoCode });
    });
  };

  return (
    <div
      className={cn(
        'w-full max-w-md rounded-3xl bg-white/10 p-5 text-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6)] ring-1 ring-white/20 backdrop-blur-2xl sm:p-7',
        className,
      )}
    >
      {otpFor ? (
        <OtpStep
          sentTo={otpFor.sentTo}
          demoCode={otpFor.demoCode}
          values={otpFor.values}
          onBack={() => {
            setOtpFor(null);
            setServerError(null);
          }}
        />
      ) : (
        <form noValidate onSubmit={handleSubmit(sendCode)}>
          <div className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] text-white/70 uppercase">
            <ScanFace className="size-4" aria-hidden />
            Free · 3D scalp scan
          </div>
          <h2 className="mt-2 font-display text-[28px] leading-[1.1] font-medium text-white sm:text-[32px]">
            Start your free hair assessment
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            A guided 3D scan of your scalp and hair roots, reviewed by a doctor — then a plan only if it can
            help you.
          </p>

          <fieldset disabled={pending} className="mt-5 space-y-3.5">
            <GlassField id={`${uid}-name`} label="Full name" error={errors.name?.message}>
              <input
                id={`${uid}-name`}
                autoComplete="name"
                className={inputClass(Boolean(errors.name))}
                aria-invalid={errors.name ? true : undefined}
                aria-describedby={`${uid}-name-err`}
                {...register('name')}
              />
            </GlassField>

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
                  maxLength={10}
                  className={cn(inputClass(Boolean(errors.mobile)), 'price rounded-l-none')}
                  aria-invalid={errors.mobile ? true : undefined}
                  aria-describedby={`${uid}-mobile-err`}
                  {...register('mobile')}
                />
              </div>
            </GlassField>

            <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-3">
              <GlassField id={`${uid}-address`} label="Address" error={errors.address?.message}>
                <input
                  id={`${uid}-address`}
                  autoComplete="street-address"
                  placeholder="House, street, city"
                  className={inputClass(Boolean(errors.address))}
                  aria-invalid={errors.address ? true : undefined}
                  aria-describedby={`${uid}-address-err`}
                  {...register('address')}
                />
              </GlassField>
              <GlassField id={`${uid}-pin`} label="PIN code" error={errors.pincode?.message}>
                <input
                  id={`${uid}-pin`}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={6}
                  className={cn(inputClass(Boolean(errors.pincode)), 'price')}
                  aria-invalid={errors.pincode ? true : undefined}
                  aria-describedby={`${uid}-pin-err`}
                  {...register('pincode')}
                />
              </GlassField>
            </div>

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
                      className="mt-0.5 size-5 border-white/40 bg-white/5 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-obsidian"
                    />
                    <label htmlFor={`${uid}-consent`} className="text-[13px] leading-snug text-white/75">
                      I agree to the{' '}
                      <Link href="/legal/privacy" className="text-white underline underline-offset-2">
                        privacy policy
                      </Link>{' '}
                      and to being contacted on WhatsApp about my assessment.
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
            Begin my 3D scan
            {!pending ? <ArrowRight className="size-4" aria-hidden /> : null}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-white/60">
            <ShieldCheck className="size-3.5" aria-hidden />
            Reviewed by a dermatologist · Takes about 4 minutes
          </p>
        </form>
      )}
    </div>
  );
}

function OtpStep({
  sentTo,
  demoCode,
  values,
  onBack,
}: {
  sentTo: string;
  demoCode: string;
  values: StartJourney;
  onBack: () => void;
}) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const hintId = useId();

  useEffect(() => {
    document.getElementById(`${hintId}-title`)?.focus();
  }, [hintId]);

  const verify = (value: string) => {
    if (value.length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setError(null);
    startTransition(async () => {
      // On success the server redirects to the scan; only failures come back here.
      const res = await startJourneyAction({ ...values, code: value });
      // A redirect resolves without a Result — guard for it.
      if (res && !res.ok) setError(res.error.message);
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
        Edit details
      </button>
      <h2
        id={`${hintId}-title`}
        tabIndex={-1}
        className="mt-1 font-display text-[28px] leading-[1.1] font-medium text-white outline-none"
      >
        Verify your mobile
      </h2>
      <p id={hintId} className="mt-2 text-sm text-white/75">
        We sent a 6-digit code on WhatsApp to <span className="price text-white">{sentTo}</span>.
      </p>
      <p className="mt-2 inline-flex rounded-md bg-white/10 px-2.5 py-1 text-[12px] text-white/80">
        Demo: use code <span className="price ml-1 text-white">{demoCode}</span>
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
        Verify and start scan
      </button>
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
