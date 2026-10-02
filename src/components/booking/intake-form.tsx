'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, Video } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { saveIntakeAction } from '@/app/(site)/book/actions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { DURATION_OPTIONS, PATTERN_OPTIONS, intakeSchema, type IntakeInput } from '@/lib/validation/booking';
import { ContinueBar } from './continue-bar';
import { PhotoUploader } from './photo-uploader';

const EMPTY: IntakeInput = {
  duration: '',
  pattern: '',
  previousTreatments: '',
  currentProducts: '',
  medicalHistory: '',
  medications: '',
  allergies: '',
  familyHistory: '',
};

const TEXT_FIELDS: {
  name: Exclude<keyof IntakeInput, 'duration' | 'pattern'>;
  label: string;
  hint: string;
}[] = [
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

/** FR-M3-10: detailed intake + 3 guided scalp photos. Draft is kept on this device until submitted. */
export function IntakeForm({
  appointmentId,
  when,
  joinHref,
  doctorName,
  initial,
  initialPhotos,
  alreadyDone,
}: {
  appointmentId: string;
  when: string;
  joinHref: string;
  doctorName: string;
  initial: IntakeInput | null;
  initialPhotos: number;
  alreadyDone: boolean;
}) {
  const draftKey = `yhc.intake.${appointmentId}`;
  const [photos, setPhotos] = useState(0);
  const [done, setDone] = useState<{ photos: number } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const restored = useRef(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IntakeInput>({ resolver: zodResolver(intakeSchema), defaultValues: initial ?? EMPTY });

  // Restore a local draft once (only when nothing was submitted before).
  useEffect(() => {
    if (restored.current || initial) return;
    restored.current = true;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = intakeSchema.partial().safeParse(JSON.parse(raw));
      if (parsed.success) reset({ ...EMPTY, ...parsed.data });
    } catch {
      /* storage unavailable — start empty */
    }
  }, [draftKey, initial, reset]);

  const values = useWatch({ control });
  useEffect(() => {
    if (!restored.current && !initial) return;
    const id = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey, JSON.stringify(values));
      } catch {
        /* storage unavailable — draft not kept */
      }
    }, 600);
    return () => window.clearTimeout(id);
  }, [values, draftKey, initial]);

  const saveDraft = () => {
    try {
      window.localStorage.setItem(draftKey, JSON.stringify(values));
      setSavedNote(
        'Draft saved on this device. You can come back to finish it anytime before the consultation.',
      );
    } catch {
      setSavedNote('We could not save a draft on this device. Please finish the form in one go.');
    }
  };

  const submit = (form: IntakeInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await saveIntakeAction({
        ...form,
        appointmentId,
        photos: photos > 0 ? photos : initialPhotos,
      });
      if (!res.ok) {
        setServerError(res.error.message);
        return;
      }
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      setDone(res.data);
      window.scrollTo({ top: 0 });
    });
  };

  if (done) {
    return <AllSet when={when} joinHref={joinHref} doctorName={doctorName} photos={done.photos} />;
  }

  return (
    <form noValidate onSubmit={handleSubmit(submit)} className="space-y-10">
      {alreadyDone ? (
        <p className="rounded-md bg-success-bg px-4 py-3 text-sm text-success">
          You&apos;ve already sent your hair profile. You can update it below until the consultation.
        </p>
      ) : null}

      <Section n={1} title="About your hair concern">
        <Controller
          control={control}
          name="duration"
          render={({ field }) => (
            <ChipGroup
              legend="How long have you noticed it?"
              options={DURATION_OPTIONS}
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
              options={PATTERN_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.pattern?.message}
            />
          )}
        />
      </Section>

      <Section
        n={2}
        title="Health and history"
        note="Private — only Dr. Tyagi and the clinical team see this."
      >
        <div className="grid gap-5 md:grid-cols-2">
          {TEXT_FIELDS.map((f) => (
            <div key={f.name} className="space-y-1.5">
              <label htmlFor={`in-${f.name}`} className="text-sm font-medium text-ink">
                {f.label}
              </label>
              <p id={`in-${f.name}-hint`} className="text-[13px] text-muted-foreground">
                {f.hint}
              </p>
              <Textarea
                id={`in-${f.name}`}
                rows={3}
                aria-describedby={`in-${f.name}-hint in-${f.name}-err`}
                aria-invalid={errors[f.name] ? true : undefined}
                className="bg-card text-base"
                {...register(f.name)}
              />
              <p id={`in-${f.name}-err`} aria-live="polite" className="text-sm text-danger">
                {errors[f.name]?.message}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        n={3}
        title="Three scalp photos"
        note="They help Dr. Tyagi see what a video call can miss. Optional, but recommended."
      >
        <PhotoUploader onChange={setPhotos} initialCount={initialPhotos} />
      </Section>

      <div aria-live="polite" className="space-y-2 text-sm">
        {serverError ? (
          <p role="alert" className="text-danger">
            {serverError}
          </p>
        ) : null}
        {savedNote ? <p className="text-muted-foreground">{savedNote}</p> : null}
      </div>

      <ContinueBar
        summary={
          <>
            <span className="block text-muted-foreground">Photos</span>
            <span className="font-medium text-ink">{photos} of 3 ready</span>
          </>
        }
      >
        <Button
          type="button"
          variant="outline"
          className="hidden h-12 px-5 md:inline-flex"
          onClick={saveDraft}
        >
          Save and finish later
        </Button>
        <Button type="submit" className="h-12 px-6 text-base md:px-10" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          ) : null}
          Send to Dr. Tyagi
        </Button>
      </ContinueBar>
      <button
        type="button"
        onClick={saveDraft}
        className="min-h-11 text-sm font-medium text-brand underline-offset-4 hover:underline md:hidden"
      >
        Save and finish later
      </button>
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
    <section className="grid gap-4 md:grid-cols-[200px_minmax(0,1fr)] md:gap-10">
      <div>
        <p className="price text-sm text-brand">0{n}</p>
        <h2 className="mt-1 text-lg font-medium text-ink">{title}</h2>
        {note ? <p className="mt-1 text-sm text-muted-foreground">{note}</p> : null}
      </div>
      <div className="space-y-6">{children}</div>
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
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink">{legend}</legend>
      <div role="radiogroup" className="mt-2.5 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o;
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o)}
              className={cn(
                'min-h-11 rounded-full border px-4 text-sm transition-colors',
                active
                  ? 'border-obsidian bg-obsidian text-on-dark'
                  : 'border-line bg-card text-ink hover:border-steel',
              )}
            >
              {o}
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

function AllSet({
  when,
  joinHref,
  doctorName,
  photos,
}: {
  when: string;
  joinHref: string;
  doctorName: string;
  photos: number;
}) {
  return (
    <section className="mx-auto max-w-2xl py-4">
      <div className="flex items-center gap-2 text-success">
        <CheckCircle2 className="size-5" aria-hidden />
        <span className="text-sm font-medium">Hair profile sent · {photos} of 3 photos</span>
      </div>
      <h1 className="display mt-3 text-[32px] md:text-[44px]">You&apos;re all set.</h1>
      <p className="mt-3 text-lg text-ink">
        {doctorName} will see you on {when}.
      </p>
      <div className="bg-hero-dark mt-8 rounded-xl p-6 text-on-dark">
        <div className="flex items-start gap-3">
          <Video className="mt-1 size-5 shrink-0 text-platinum" aria-hidden />
          <div>
            <p className="font-medium">How to join</p>
            <ul className="mt-2 space-y-1.5 text-sm text-on-dark-muted">
              <li>Open the link from your WhatsApp reminder, or the button below, 5 minutes before.</li>
              <li>Use a phone or laptop with a camera, in a quiet, well-lit room.</li>
              <li>{doctorName} will admit you from the waiting room. The call is not recorded.</li>
            </ul>
            <Button asChild className="bg-silver mt-5 h-12 px-6 text-base text-obsidian hover:opacity-90">
              <Link href={joinHref}>Open your consultation room</Link>
            </Button>
          </div>
        </div>
      </div>
      {photos < 3 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          You can add the remaining photos anytime before the consultation from this page.
        </p>
      ) : null}
      <p className="mt-6 text-sm">
        <Link href="/account" className="font-medium text-brand underline underline-offset-4">
          Go to your account
        </Link>
      </p>
    </section>
  );
}
