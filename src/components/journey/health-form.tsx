'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Controller, useForm, type Control, type DefaultValues } from 'react-hook-form';
import { saveJourneyDetailsAction } from '@/app/(site)/start/actions';
import { ContinueBar } from '@/components/booking/continue-bar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CONCERN_OPTIONS, DURATION_OPTIONS, PATTERN_OPTIONS } from '@/lib/validation/booking';
import {
  GENDER_OPTIONS,
  journeyDetailsSchema,
  type JourneyDetails,
  type JourneyDetailsInput,
} from '@/lib/validation/journey';

type TextKey =
  'previousTreatments' | 'currentProducts' | 'medicalHistory' | 'medications' | 'allergies' | 'familyHistory';

const TEXT_FIELDS: { name: TextKey; label: string; hint: string }[] = [
  {
    name: 'previousTreatments',
    label: 'Treatments you have tried',
    hint: 'Tablets, lotions, PRP, home remedies — and roughly for how long. Write "None" if none.',
  },
  {
    name: 'currentProducts',
    label: 'What you use on your hair now',
    hint: 'Shampoo, oil, serum, styling products.',
  },
  {
    name: 'medicalHistory',
    label: 'Relevant health history',
    hint: 'Thyroid, anaemia, PCOS, recent illness or surgery, major stress.',
  },
  { name: 'medications', label: 'Medicines you take', hint: 'Include supplements. Write "None" if none.' },
  { name: 'allergies', label: 'Allergies', hint: 'Medicines, ingredients or foods.' },
  { name: 'familyHistory', label: 'Hair loss in the family', hint: 'Parents, grandparents, siblings.' },
];

/** Step 4 — the detailed health form (ADR-26). Private: only the doctor and clinical team see it. */
export function HealthForm({
  defaults,
  doctorName,
}: {
  defaults: DefaultValues<JourneyDetailsInput>;
  doctorName: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JourneyDetailsInput, unknown, JourneyDetails>({
    resolver: zodResolver(journeyDetailsSchema),
    defaultValues: defaults,
  });

  const submit = (values: JourneyDetails) => {
    setServerError(null);
    startTransition(async () => {
      const res = await saveJourneyDetailsAction({ ...values, age: String(values.age) });
      if (!res.ok) {
        setServerError(res.error.message);
        return;
      }
      router.push(res.data.next);
    });
  };

  return (
    <form noValidate onSubmit={handleSubmit(submit)}>
      <fieldset
        disabled={pending}
        className="divide-y divide-line [&>section]:py-8 md:[&>section]:py-10 [&>section:first-child]:pt-0"
      >
        <Section n={1} title="About you">
          <div className="grid gap-x-6 gap-y-2 sm:grid-cols-[160px_minmax(0,1fr)]">
            <div>
              <label htmlFor="hf-age" className="block text-sm font-medium text-ink">
                Age
              </label>
              <Input
                id="hf-age"
                inputMode="numeric"
                maxLength={3}
                className="price mt-2.5 h-11 bg-card text-base"
                aria-invalid={errors.age ? true : undefined}
                aria-describedby="hf-age-err"
                {...register('age')}
              />
              <p id="hf-age-err" aria-live="polite" className="mt-1.5 min-h-5 text-sm text-danger">
                {errors.age?.message}
              </p>
            </div>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <ChipGroup
                  legend="Gender"
                  options={GENDER_OPTIONS.map((g) => ({ value: g.value, label: g.label }))}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.gender ? 'Please choose one' : undefined}
                />
              )}
            />
          </div>
          <Controller
            control={control}
            name="concern"
            render={({ field }) => (
              <ChipGroup
                legend="What would you most like help with?"
                options={CONCERN_OPTIONS.map((c) => ({ value: c.value, label: c.label }))}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.concern ? 'Please choose the closest concern' : undefined}
              />
            )}
          />
        </Section>

        <Section n={2} title="Your hair concern">
          <Controller
            control={control}
            name="duration"
            render={({ field }) => (
              <ChipGroup
                legend="How long have you noticed it?"
                options={DURATION_OPTIONS.map((o) => ({ value: o, label: o }))}
                value={field.value}
                onChange={field.onChange}
                error={errors.duration?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="pattern"
            render={({ field }) => (
              <ChipGroup
                legend="Where do you notice it most?"
                options={PATTERN_OPTIONS.map((o) => ({ value: o, label: o }))}
                value={field.value}
                onChange={field.onChange}
                error={errors.pattern?.message}
              />
            )}
          />
        </Section>

        <Section
          n={3}
          title="Health and history"
          note={`Private — only ${doctorName} and the clinical team see this.`}
        >
          <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
            {TEXT_FIELDS.map((f) => (
              <div key={f.name} className="flex flex-col">
                <label htmlFor={`hf-${f.name}`} className="text-sm font-medium text-ink">
                  {f.label}
                </label>
                <p id={`hf-${f.name}-hint`} className="mt-1 mb-2 flex-1 text-[13px] text-muted-foreground">
                  {f.hint}
                </p>
                <Textarea
                  id={`hf-${f.name}`}
                  rows={3}
                  aria-describedby={`hf-${f.name}-hint hf-${f.name}-err`}
                  aria-invalid={errors[f.name] ? true : undefined}
                  className="min-h-24 resize-y bg-card text-base"
                  {...register(f.name)}
                />
                <p id={`hf-${f.name}-err`} aria-live="polite" className="mt-1.5 min-h-5 text-sm text-danger">
                  {errors[f.name]?.message}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section n={4} title="Consent">
          <div className="space-y-1">
            <ConsentRow
              control={control}
              name="consentTelemedicine"
              error={errors.consentTelemedicine?.message}
            >
              I agree to a video consultation (telemedicine) with {doctorName}, a registered medical
              practitioner.
            </ConsentRow>
            <ConsentRow control={control} name="consentPrivacy" error={errors.consentPrivacy?.message}>
              I accept the{' '}
              <Link href="/legal/privacy" className="text-brand underline underline-offset-2">
                privacy policy
              </Link>{' '}
              and{' '}
              <Link href="/legal/terms" className="text-brand underline underline-offset-2">
                terms
              </Link>
              , and agree that my scan and health answers are shared with the doctor.
            </ConsentRow>
          </div>
        </Section>
      </fieldset>

      <p aria-live="assertive" className={cn('mt-6 text-sm text-danger', !serverError && 'sr-only')}>
        {serverError}
      </p>

      <ContinueBar
        className="lg:pl-[240px]"
        summary={
          <>
            <span className="block text-muted-foreground">Next</span>
            <span className="font-medium text-ink">Pick a time with the doctor</span>
          </>
        }
      >
        <Button type="submit" className="h-12 px-6 text-base md:px-10" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : null}
          Continue to booking
          {!pending ? <ArrowRight className="size-4" aria-hidden /> : null}
        </Button>
      </ContinueBar>
    </form>
  );
}

function Section({
  n,
  title,
  note,
  children,
}: {
  n: number;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
      <div>
        <p className="price text-sm text-brand">0{n}</p>
        <h2 className="mt-1 font-display text-2xl leading-tight font-medium text-ink">{title}</h2>
        {note ? <p className="mt-2 max-w-xs text-sm text-pretty text-muted-foreground">{note}</p> : null}
      </div>
      <div className="min-w-0 space-y-5">{children}</div>
    </section>
  );
}

function ChipGroup({
  legend,
  options,
  value,
  onChange,
  error,
}: {
  legend: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      <div role="radiogroup" className="mt-2.5 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={cn(
                'min-h-11 rounded-full border px-4 text-sm transition-colors',
                active
                  ? 'border-obsidian bg-obsidian text-on-dark'
                  : 'border-line bg-card text-ink hover:border-steel',
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="mt-1.5 min-h-5 text-sm text-danger">
        {error}
      </p>
    </fieldset>
  );
}

function ConsentRow({
  control,
  name,
  error,
  children,
}: {
  control: Control<JourneyDetailsInput, unknown, JourneyDetails>;
  name: 'consentTelemedicine' | 'consentPrivacy';
  error?: string;
  children: React.ReactNode;
}) {
  const id = `hf-${name}`;
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
              aria-required
              className="mt-0.5 size-5 bg-card"
            />
            <label htmlFor={id} className="text-sm leading-snug text-body">
              {children}
              <span className="text-muted-foreground"> (required)</span>
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
