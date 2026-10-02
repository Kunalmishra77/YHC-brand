'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Controller, useForm, type Control } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  CONCERN_OPTIONS,
  bookingDetailsSchema,
  type BookingDetails,
  type BookingDetailsInput,
} from '@/lib/validation/booking';

export const DETAILS_FORM_ID = 'booking-details';

/** FR-M3-4: the short form — name, age (18+), main concern, consents. Submitted from the ContinueBar. */
export function DetailsForm({
  defaults,
  onSubmit,
  disabled,
  serverError,
}: {
  defaults: { name: string | null; age: number | null };
  onSubmit: (values: BookingDetails) => void;
  disabled: boolean;
  serverError: string | null;
}) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingDetailsInput, unknown, BookingDetails>({
    resolver: zodResolver(bookingDetailsSchema),
    defaultValues: {
      name: defaults.name ?? '',
      age: defaults.age ? String(defaults.age) : '',
      concern: undefined,
      consentTelemedicine: false,
      consentPrivacy: false,
      consentWhatsapp: true,
    },
  });

  return (
    <form id={DETAILS_FORM_ID} noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-7">
      <fieldset disabled={disabled} className="space-y-7">
        <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
          <Field label="Full name" error={errors.name?.message} htmlFor="bk-name">
            <Input
              id="bk-name"
              autoComplete="name"
              className="h-12 bg-card text-base"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby="bk-name-err"
              {...register('name')}
            />
          </Field>
          <Field label="Age" error={errors.age?.message} htmlFor="bk-age">
            <Input
              id="bk-age"
              inputMode="numeric"
              maxLength={3}
              className="price h-12 bg-card text-base"
              aria-invalid={errors.age ? true : undefined}
              aria-describedby="bk-age-err"
              {...register('age')}
            />
          </Field>
        </div>

        <Controller
          control={control}
          name="concern"
          render={({ field }) => (
            <fieldset aria-describedby="bk-concern-err">
              <legend className="text-sm font-medium text-ink">What would you most like help with?</legend>
              <p className="mt-1 text-sm text-muted-foreground">
                Pick the closest — you can explain more later.
              </p>
              <div role="radiogroup" className="mt-3 grid gap-2 sm:grid-cols-2">
                {CONCERN_OPTIONS.map((o) => {
                  const active = field.value === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => field.onChange(o.value)}
                      onBlur={field.onBlur}
                      className={cn(
                        'min-h-14 rounded-md border px-3.5 py-2.5 text-left transition-colors',
                        active ? 'border-brand bg-info-bg/50' : 'border-line bg-card hover:border-steel',
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-ink">
                        <span
                          aria-hidden
                          className={cn(
                            'size-4 shrink-0 rounded-full border',
                            active ? 'border-[5px] border-brand' : 'border-steel',
                          )}
                        />
                        {o.label}
                      </span>
                      <span className="mt-0.5 block pl-6 text-[13px] text-muted-foreground">{o.hint}</span>
                    </button>
                  );
                })}
              </div>
              <p id="bk-concern-err" aria-live="polite" className="mt-2 min-h-5 text-sm text-danger">
                {errors.concern ? 'Please choose the closest concern' : null}
              </p>
            </fieldset>
          )}
        />

        <fieldset className="space-y-1">
          <legend className="mb-2 text-sm font-medium text-ink">Consent</legend>
          <ConsentRow
            control={control}
            name="consentTelemedicine"
            error={errors.consentTelemedicine?.message}
            required
          >
            I agree to a video consultation (telemedicine) with Dr. Tyagi, a registered medical practitioner.
          </ConsentRow>
          <ConsentRow control={control} name="consentPrivacy" error={errors.consentPrivacy?.message} required>
            I accept the{' '}
            <Link href="/legal/privacy" className="text-brand underline underline-offset-2">
              privacy policy
            </Link>{' '}
            and{' '}
            <Link href="/legal/terms" className="text-brand underline underline-offset-2">
              terms
            </Link>
            .
          </ConsentRow>
          <ConsentRow control={control} name="consentWhatsapp">
            Send me booking updates and reminders on WhatsApp (optional — you can stop anytime).
          </ConsentRow>
        </fieldset>
      </fieldset>

      <p aria-live="assertive" className={cn('text-sm text-danger', serverError ? '' : 'sr-only')}>
        {serverError}
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      <p id={`${htmlFor}-err`} aria-live="polite" className="min-h-5 text-sm text-danger">
        {error}
      </p>
    </div>
  );
}

function ConsentRow({
  control,
  name,
  error,
  required,
  children,
}: {
  control: Control<BookingDetailsInput, unknown, BookingDetails>;
  name: 'consentTelemedicine' | 'consentPrivacy' | 'consentWhatsapp';
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const id = `bk-${name}`;
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div>
          <div className="flex min-h-11 items-start gap-3 py-1.5">
            <Checkbox
              id={id}
              checked={field.value}
              onCheckedChange={(v) => field.onChange(v === true)}
              onBlur={field.onBlur}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-err` : undefined}
              aria-required={required || undefined}
              className="mt-0.5 size-5 bg-card"
            />
            <label htmlFor={id} className="text-sm leading-snug text-body">
              {children}
              {required ? <span className="text-muted-foreground"> (required)</span> : null}
            </label>
          </div>
          {error ? (
            <p id={`${id}-err`} role="alert" className="pl-8 text-sm text-danger">
              {error}
            </p>
          ) : null}
        </div>
      )}
    />
  );
}
