'use client';

import { CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useId, useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import type { Concern, HairConcern } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { saveAssessmentResult } from './actions';

type QuestionId = 'age' | 'concern' | 'duration' | 'pattern' | 'family' | 'previous' | 'scalp' | 'trigger';

interface Question {
  id: QuestionId;
  title: string;
  hint?: string;
  options: { value: string; label: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'age',
    title: 'Which age band are you in?',
    hint: 'Consultations are for adults, so we ask this first.',
    options: [
      { value: 'under18', label: 'Under 18' },
      { value: '18-24', label: '18–24' },
      { value: '25-34', label: '25–34' },
      { value: '35-44', label: '35–44' },
      { value: '45+', label: '45 or over' },
    ],
  },
  {
    id: 'concern',
    title: 'What are you noticing most?',
    options: [
      { value: 'hair_fall', label: 'More hair falling than usual' },
      { value: 'thinning', label: 'Hair looks thinner overall' },
      { value: 'receding_hairline', label: 'Hairline moving back' },
      { value: 'crown_thinning', label: 'Thinning at the crown' },
      { value: 'dandruff_scalp', label: 'Dandruff, itching or flaking' },
      { value: 'other', label: 'Something else' },
    ],
  },
  {
    id: 'duration',
    title: 'How long has this been going on?',
    options: [
      { value: 'lt3m', label: 'Less than 3 months' },
      { value: '3-12m', label: '3 to 12 months' },
      { value: '1-3y', label: '1 to 3 years' },
      { value: 'gt3y', label: 'More than 3 years' },
    ],
  },
  {
    id: 'pattern',
    title: 'Where is the change most visible?',
    options: [
      { value: 'diffuse', label: 'All over the scalp' },
      { value: 'front', label: 'Front or temples' },
      { value: 'crown', label: 'Crown (top or back)' },
      { value: 'patches', label: 'Round or uneven patches' },
      { value: 'unsure', label: "I'm not sure" },
    ],
  },
  {
    id: 'family',
    title: 'Has a parent or sibling had thinning hair?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: "I don't know" },
    ],
  },
  {
    id: 'previous',
    title: 'What have you tried so far?',
    options: [
      { value: 'none', label: 'Nothing yet' },
      { value: 'cosmetic', label: 'Shampoos, oils or serums' },
      { value: 'supplements', label: 'Supplements' },
      { value: 'prescription', label: 'A prescription treatment' },
      { value: 'procedure', label: 'A clinic procedure' },
    ],
  },
  {
    id: 'scalp',
    title: 'Does your scalp itch, flake or feel sore?',
    options: [
      { value: 'yes', label: 'Yes, often' },
      { value: 'sometimes', label: 'Sometimes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'trigger',
    title: 'In the last 6 months, have you had a major illness, high stress, a big diet change or a baby?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'unsure', label: 'Not sure' },
    ],
  },
];

type Answers = Partial<Record<QuestionId, string>>;

/** Turns answers into things worth raising at the consultation. Never a diagnosis. */
function talkingPoints(a: Answers): string[] {
  const points: string[] = [];
  if (a.pattern === 'patches')
    points.push('Patchy hair loss is worth showing to a doctor soon, so mention when you first noticed it.');
  if (a.trigger === 'yes')
    points.push(
      'A recent illness, stress, diet change or pregnancy can affect shedding. Share the dates at your consultation.',
    );
  if (a.family === 'yes')
    points.push('Family history helps the doctor understand your pattern. Note who was affected, and when.');
  if (a.scalp === 'yes' || a.scalp === 'sometimes' || a.concern === 'dandruff_scalp')
    points.push('Scalp symptoms matter — your scalp photos will help Dr. Tyagi see what is going on.');
  if (a.previous && a.previous !== 'none')
    points.push('Bring the names of anything you have used, and for how long.');
  if (points.length === 0)
    points.push('Your history and scalp photos give Dr. Tyagi the full picture before the call.');
  return points;
}

export function AssessmentQuiz({ concerns, bookLabel }: { concerns: Concern[]; bookLabel: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const baseId = useId();

  const question = QUESTIONS[step];
  const done = step >= QUESTIONS.length;
  const under18 = answers.age === 'under18';

  function focusHeading() {
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function next() {
    if (!question) return;
    if (question.id === 'age' && answers.age === 'under18') {
      setStep(QUESTIONS.length); // stop early, kindly
    } else {
      setStep((s) => s + 1);
    }
    focusHeading();
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
    focusHeading();
  }

  function restart() {
    setAnswers({});
    setStep(0);
    focusHeading();
  }

  if (done && under18) {
    return (
      <div className="rounded-xl border border-line bg-card p-6 md:p-8">
        <h2 ref={headingRef} tabIndex={-1} className="display text-3xl outline-none">
          Thank you for checking.
        </h2>
        <p className="mt-4 max-w-xl text-body">
          Our online consultations are for adults aged 18 and over, so we can&apos;t suggest a plan here. Hair
          changes at your age are worth talking about — please speak to a parent or guardian and see a doctor
          in person, who can examine you properly.
        </p>
        <Button variant="outline" className="mt-6 h-11 px-5" onClick={restart}>
          Start again
        </Button>
      </div>
    );
  }

  if (done) {
    const concernSlug = (answers.concern ?? 'other') as HairConcern;
    const concern = concerns.find((c) => c.slug === concernSlug) ?? null;
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-line bg-card p-6 md:p-8">
          <p className="flex items-start gap-2 rounded-md bg-info-bg px-3 py-2 text-sm text-info">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            This is not a diagnosis. Only a doctor who has reviewed your history and scalp can tell you what
            is causing a change.
          </p>
          <h2 ref={headingRef} tabIndex={-1} className="display mt-6 text-3xl outline-none">
            Your next step: a consultation with Dr. Tyagi
          </h2>
          {concern ? (
            <p className="mt-4 max-w-2xl text-body">
              You told us about <span className="font-medium text-ink">{concern.title.toLowerCase()}</span>.{' '}
              {concern.body}
            </p>
          ) : (
            <p className="mt-4 max-w-2xl text-body">
              What you are noticing doesn&apos;t fit a simple label — that is common, and exactly what a
              consultation is for.
            </p>
          )}
          <h3 className="mt-6 font-semibold text-ink">Worth raising at your consultation</h3>
          <ul className="mt-3 space-y-2 text-body">
            {talkingPoints(answers).map((p) => (
              <li key={p} className="flex gap-3">
                <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-steel" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-12 px-6 text-base">
              <Link href={`/book?concern=${concernSlug}`}>{bookLabel}</Link>
            </Button>
            {concern ? (
              <Button asChild variant="outline" className="h-12 border-steel px-6 text-base">
                <Link href={`/concerns/${concern.slug}`}>Read about {concern.title.toLowerCase()}</Link>
              </Button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={restart}
            className="mt-4 inline-flex min-h-11 items-center text-sm text-muted-foreground underline underline-offset-2 hover:text-ink"
          >
            Change my answers
          </button>
        </div>
        <SaveResult />
      </div>
    );
  }

  if (!question) return null;
  const selected = answers[question.id];
  const progress = Math.round((step / QUESTIONS.length) * 100);

  return (
    <div className="rounded-xl border border-line bg-card p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>
          Question <span className="price text-ink">{step + 1}</span> of {QUESTIONS.length}
        </span>
        <span className="price">{progress}%</span>
      </div>
      <Progress
        value={progress}
        aria-label={`Question ${step + 1} of ${QUESTIONS.length}`}
        className="mt-2 h-1.5 bg-mist"
      />
      <fieldset className="mt-8">
        <legend className="w-full">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-xl font-semibold text-ink outline-none md:text-2xl"
          >
            {question.title}
          </h2>
          {question.hint ? <p className="mt-2 text-sm text-muted-foreground">{question.hint}</p> : null}
        </legend>
        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {question.options.map((opt) => {
            const id = `${baseId}-${question.id}-${opt.value}`;
            const checked = selected === opt.value;
            return (
              <label
                key={opt.value}
                htmlFor={id}
                className={cn(
                  'flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-ink transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand',
                  checked ? 'border-obsidian bg-mist/60' : 'border-line hover:border-steel',
                )}
              >
                <input
                  id={id}
                  type="radio"
                  name={question.id}
                  value={opt.value}
                  checked={checked}
                  onChange={() => setAnswers((a) => ({ ...a, [question.id]: opt.value }))}
                  className="size-4 accent-obsidian"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="mt-8 flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" className="h-12 px-5" onClick={back} disabled={step === 0}>
          Back
        </Button>
        <Button type="button" className="h-12 px-8 text-base" onClick={next} disabled={!selected}>
          {step === QUESTIONS.length - 1 ? 'See my next step' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}

/** Phone + demo OTP → creates a CRM lead. Answers are never sent with it. */
function SaveResult() {
  const [phase, setPhase] = useState<'phone' | 'code' | 'saved'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function sendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError('Enter a 10-digit Indian mobile number.');
      return;
    }
    setError(null);
    setPhase('code'); // Demo: no message is sent.
  }

  function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveAssessmentResult({ phone, code });
      if (result.ok) setPhase('saved');
      else setError(result.error.message);
    });
  }

  if (phase === 'saved') {
    return (
      <div role="status" className="rounded-xl bg-success-bg p-6">
        <p className="flex items-center gap-2 font-semibold text-success">
          <CheckCircle2 className="size-5" aria-hidden />
          Saved to +91 {phone}
        </p>
        <p className="mt-2 text-body">
          A YHC care advisor may message you on WhatsApp to help you book. They see your name and number only
          — not your answers. Next: pick a consultation time.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-platinum p-6 md:p-8">
      <h3 className="flex items-center gap-2 font-semibold text-ink">
        <ShieldCheck className="size-5 text-brand" aria-hidden />
        Save your result
      </h3>
      <p className="mt-2 max-w-xl text-sm text-body">
        Verify your mobile number to come back to this later. We may contact you on WhatsApp about booking;
        your answers are not shared with our sales team.
      </p>
      {phase === 'phone' ? (
        <form onSubmit={sendCode} noValidate className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="assess-phone">Mobile number</Label>
            <div className="flex">
              <span className="flex h-12 items-center rounded-l-md border border-r-0 border-input bg-mist px-3 text-sm text-ink">
                +91
              </span>
              <Input
                id="assess-phone"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                aria-invalid={error ? true : undefined}
                aria-describedby="assess-error"
                className="h-12 rounded-l-none bg-card text-base"
              />
            </div>
          </div>
          <Button type="submit" className="h-12 px-6">
            Send code
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} noValidate className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="assess-code">6-digit code sent to +91 {phone}</Label>
            <Input
              id="assess-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              aria-invalid={error ? true : undefined}
              aria-describedby="assess-error assess-hint"
              className="price h-12 bg-card text-base tracking-[0.4em]"
            />
            <p id="assess-hint" className="text-sm text-muted-foreground">
              Demo code: 123456 ·{' '}
              <button
                type="button"
                className="underline underline-offset-2 hover:text-ink"
                onClick={() => {
                  setPhase('phone');
                  setCode('');
                  setError(null);
                }}
              >
                Change number
              </button>
            </p>
          </div>
          <Button type="submit" className="h-12 px-6" disabled={pending || code.length !== 6}>
            {pending ? 'Verifying…' : 'Verify and save'}
          </Button>
        </form>
      )}
      <p id="assess-error" aria-live="polite" className={cn('mt-2 text-sm text-danger', !error && 'sr-only')}>
        {error ?? ''}
      </p>
    </div>
  );
}
