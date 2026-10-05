'use client';

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  CameraOff,
  Check,
  ImageUp,
  Loader2,
  RefreshCcw,
  RotateCcw,
  ScanLine,
  SwitchCamera,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { submitScanAction } from '@/app/(site)/start/actions';
import {
  ANGLE_LABEL,
  DURATION_ANSWERS,
  FAMILY_ANSWERS,
  LONG_BALD_ANSWERS,
  PATTERN_ANSWERS,
} from '@/lib/journey/labels';
import { SCAN_ANGLES, type ScanAngle, type ScanAnswers } from '@/lib/journey/types';
import { cn } from '@/lib/utils';
import { AngleGuide } from './angle-guide';
import styles from './journey.module.css';
import { ProgressRing } from './meters';

/*
 * Guided 3D scalp scan (ADR-26 demo). Pre-scan questions → 4 guided camera captures (getUserMedia with
 * a file-upload fallback) → staged "analysis". Photos are re-encoded/downscaled on a canvas and kept
 * only as local previews — nothing is uploaded; the server receives the answers and which angles
 * were captured, and computes a SIMULATED result.
 */

type Phase = 'intro' | 'questions' | 'capture' | 'analysing';

const ANGLE_TIPS: Record<ScanAngle, string> = {
  front: 'Face the camera, push your hair back so the forehead and temples are in view.',
  crown: 'Hold the phone above the top-back of your head, or ask someone to help.',
  parting: 'Part your hair in the middle and point the camera straight down along the line.',
  closeup: 'Bring the camera close to the area that worries you most. Good light helps.',
};

const DEFAULT_FACING: Record<ScanAngle, 'user' | 'environment'> = {
  front: 'user',
  crown: 'environment',
  parting: 'environment',
  closeup: 'environment',
};

const STAGES = [
  'Mapping scalp surface',
  'Detecting follicles',
  'Measuring root density',
  'Checking roots and scalp health',
] as const;
const ANALYSIS_MS = 6000;
const MAX_EDGE = 1280;

interface Question<K extends keyof ScanAnswers> {
  key: K;
  title: string;
  hint: string;
  options: { value: ScanAnswers[K]; label: string; hint?: string }[];
}

const QUESTIONS: [
  Question<'duration'>,
  Question<'pattern'>,
  Question<'longBald'>,
  Question<'familyHistory'>,
] = [
  {
    key: 'duration',
    title: 'How long have you noticed thinning?',
    hint: 'Your best guess is fine.',
    options: DURATION_ANSWERS,
  },
  {
    key: 'pattern',
    title: 'Where do you notice it most?',
    hint: 'Pick the closest pattern.',
    options: PATTERN_ANSWERS,
  },
  {
    key: 'longBald',
    title: 'Is any area completely bald for 5 years or more?',
    hint: 'Smooth skin with no hair at all, for a long time.',
    options: LONG_BALD_ANSWERS,
  },
  {
    key: 'familyHistory',
    title: 'Does hair loss run in your family?',
    hint: 'Parents, grandparents or siblings.',
    options: FAMILY_ANSWERS,
  },
];

type Shot = { url: string; kb: number };

async function encodeToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode_failed'))), 'image/jpeg', 0.8),
  );
}

/** Downscale + re-encode (drops EXIF/GPS). Source is a video frame or a decoded bitmap. */
async function reencode(source: CanvasImageSource, width: number, height: number): Promise<Blob> {
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no_canvas');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return encodeToBlob(canvas);
}

export function ScanStudio({ firstName, hasScan }: { firstName: string; hasScan: boolean }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<ScanAnswers>>({});
  const [shots, setShots] = useState<Partial<Record<ScanAngle, Shot>>>({});
  const [angleIndex, setAngleIndex] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const urls = useRef<string[]>([]);

  useEffect(
    () => () => {
      for (const u of urls.current) URL.revokeObjectURL(u);
    },
    [],
  );

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [phase, qIndex, angleIndex]);

  const addShot = (angle: ScanAngle, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    urls.current.push(url);
    setShots((prev) => ({ ...prev, [angle]: { url, kb: Math.round(blob.size / 1024) } }));
  };

  const complete = useMemo(
    () =>
      answers.duration && answers.pattern && answers.longBald && answers.familyHistory
        ? (answers as ScanAnswers)
        : null,
    [answers],
  );
  const captured = useMemo(() => SCAN_ANGLES.filter((a) => shots[a]), [shots]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      {phase === 'intro' ? (
        <Intro
          firstName={firstName}
          hasScan={hasScan}
          headingRef={headingRef}
          onStart={() => setPhase('questions')}
        />
      ) : null}

      {phase === 'questions' ? (
        <Questions
          index={qIndex}
          answers={answers}
          headingRef={headingRef}
          onBack={() => (qIndex === 0 ? setPhase('intro') : setQIndex(qIndex - 1))}
          onAnswer={(key, value) => {
            setAnswers((prev) => ({ ...prev, [key]: value }));
            if (qIndex < QUESTIONS.length - 1) setQIndex(qIndex + 1);
            else setPhase('capture');
          }}
        />
      ) : null}

      {phase === 'capture' ? (
        <Capture
          angleIndex={angleIndex}
          onAngle={setAngleIndex}
          shots={shots}
          headingRef={headingRef}
          onShot={addShot}
          onRetake={(a) => setShots((prev) => ({ ...prev, [a]: undefined }))}
          onBack={() => {
            setQIndex(QUESTIONS.length - 1);
            setPhase('questions');
          }}
          onDone={() => setPhase('analysing')}
        />
      ) : null}

      {phase === 'analysing' && complete ? (
        <Analysing
          answers={complete}
          angles={captured}
          preview={shots.closeup?.url ?? shots.crown?.url ?? null}
          headingRef={headingRef}
          onDone={() => router.push('/start/assessment')}
          onBack={() => setPhase('capture')}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------

function Intro({
  firstName,
  hasScan,
  headingRef,
  onStart,
}: {
  firstName: string;
  hasScan: boolean;
  headingRef: React.Ref<HTMLHeadingElement>;
  onStart: () => void;
}) {
  return (
    <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <div>
        <p className="text-[13px] font-semibold tracking-[0.14em] text-brand-on-dark uppercase">
          Guided 3D scalp scan
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 font-display text-[36px] leading-[1.05] font-medium text-on-dark outline-none md:text-[52px]"
        >
          {firstName
            ? `${firstName}, let's map your scalp and hair roots`
            : "Let's map your scalp and hair roots"}
        </h1>
        <p className="mt-4 max-w-xl text-on-dark-muted">
          Four quick questions, then your phone camera guides you through four angles. The scan builds a
          picture of root density and scalp health for your doctor to review.
        </p>
        <ol className="mt-7 grid gap-3 sm:grid-cols-3">
          {[
            ['4 questions', 'About your hair history'],
            ['4 angles', 'Hairline, crown, parting, close-up'],
            ['Analysis', 'Roots, density and scalp health'],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <p className="price text-[13px] text-platinum">0{i + 1}</p>
              <p className="mt-1 font-medium text-on-dark">{t}</p>
              <p className="mt-0.5 text-[13px] text-on-dark-muted">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={onStart}
            className="bg-silver inline-flex h-12 items-center justify-center gap-2 rounded-xl px-7 text-[15px] font-semibold text-obsidian hover:opacity-95"
          >
            Start my scan
            <ArrowRight className="size-4" aria-hidden />
          </button>
          {hasScan ? (
            <Link
              href="/start/assessment"
              className="inline-flex min-h-11 items-center justify-center px-2 text-sm text-on-dark-muted underline underline-offset-4 hover:text-on-dark"
            >
              View your existing assessment
            </Link>
          ) : null}
        </div>
        <p className="mt-5 max-w-xl text-[13px] text-on-dark-muted">
          Demo: your photos stay on this device and are never uploaded. Only which angles you captured is
          sent, and the analysis is simulated — your doctor makes the final assessment.
        </p>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-[380px]">
        <div className={cn('absolute inset-0 rounded-full ring-1 ring-white/10', styles.grid)} />
        <svg viewBox="0 0 200 200" className={cn('absolute inset-0', styles.orbit)} aria-hidden>
          <circle
            cx="100"
            cy="100"
            r="96"
            fill="none"
            stroke="rgba(230,232,236,0.25)"
            strokeDasharray="2 6"
          />
          <circle cx="100" cy="4" r="3" fill="rgba(230,232,236,0.9)" />
        </svg>
        <div className="absolute inset-[12%] overflow-hidden rounded-full bg-white/[0.03] ring-1 ring-white/15">
          <AngleGuide angle="crown" className="size-full" />
          <span className={styles.scanLine} aria-hidden />
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------

function Questions({
  index,
  answers,
  headingRef,
  onBack,
  onAnswer,
}: {
  index: number;
  answers: Partial<ScanAnswers>;
  headingRef: React.Ref<HTMLHeadingElement>;
  onBack: () => void;
  onAnswer: <K extends keyof ScanAnswers>(key: K, value: ScanAnswers[K]) => void;
}) {
  const q = QUESTIONS[index] ?? QUESTIONS[0];
  const current = answers[q.key];
  return (
    <section className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <BackButton onClick={onBack}>Back</BackButton>
        <p className="text-[13px] text-on-dark-muted">
          Question {index + 1} of {QUESTIONS.length}
        </p>
      </div>
      <div className="mt-3 flex gap-1" aria-hidden>
        {QUESTIONS.map((x, i) => (
          <span
            key={x.key}
            className={cn('h-1 flex-1 rounded-full', i <= index ? 'bg-silver' : 'bg-white/15')}
          />
        ))}
      </div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-8 font-display text-[30px] leading-[1.1] font-medium text-on-dark outline-none md:text-[40px]"
      >
        {q.title}
      </h1>
      <p className="mt-2 text-on-dark-muted">{q.hint}</p>
      <div role="radiogroup" aria-label={q.title} className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {q.options.map((o) => {
          const active = current === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onAnswer(q.key, o.value as never)}
              className={cn(
                'flex min-h-14 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left ring-1 transition-colors',
                active
                  ? 'bg-white/15 ring-white/60'
                  : 'bg-white/5 ring-white/10 hover:bg-white/10 hover:ring-white/25',
              )}
            >
              <span>
                <span className="block font-medium text-on-dark">{o.label}</span>
                {o.hint ? (
                  <span className="mt-0.5 block text-[13px] text-on-dark-muted">{o.hint}</span>
                ) : null}
              </span>
              {active ? <Check className="size-4 shrink-0 text-on-dark" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------

type CameraState = 'idle' | 'starting' | 'live' | 'unavailable';

function Capture({
  angleIndex,
  onAngle,
  shots,
  headingRef,
  onShot,
  onRetake,
  onBack,
  onDone,
}: {
  angleIndex: number;
  onAngle: (i: number) => void;
  shots: Partial<Record<ScanAngle, Shot>>;
  headingRef: React.Ref<HTMLHeadingElement>;
  onShot: (angle: ScanAngle, blob: Blob) => void;
  onRetake: (angle: ScanAngle) => void;
  onBack: () => void;
  onDone: () => void;
}) {
  const angle = SCAN_ANGLES[angleIndex] ?? 'front';
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [camera, setCamera] = useState<CameraState>('idle');
  const [facing, setFacing] = useState<'user' | 'environment'>(DEFAULT_FACING[angle]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const shot = shots[angle];
  const ready = SCAN_ANGLES.filter((a) => shots[a]).length;

  const stop = useCallback(() => {
    for (const t of streamRef.current?.getTracks() ?? []) t.stop();
    streamRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const start = useCallback(
    async (face: 'user' | 'environment') => {
      stop();
      setError(null);
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCamera('unavailable');
        return;
      }
      setCamera('starting');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: face }, width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        streamRef.current = stream;
        setFacing(face);
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => undefined);
        }
        setCamera('live');
      } catch {
        stop();
        setCamera('unavailable');
      }
    },
    [stop],
  );

  const goTo = (i: number) => {
    const next = SCAN_ANGLES[i];
    onAngle(i);
    if (next && camera === 'live' && DEFAULT_FACING[next] !== facing) void start(DEFAULT_FACING[next]);
  };

  const capture = async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    setBusy(true);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 180);
    try {
      onShot(angle, await reencode(video, video.videoWidth, video.videoHeight));
    } catch {
      setError('We could not capture that frame. Please try again or upload a photo.');
    } finally {
      setBusy(false);
    }
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('That file is not a photo. Please choose a JPG or PNG.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const blob = await reencode(bitmap, bitmap.width, bitmap.height);
      bitmap.close();
      onShot(angle, blob);
    } catch {
      setError('We could not read that photo. Please try another one.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton onClick={onBack}>Back to questions</BackButton>
        <p className="text-[13px] text-on-dark-muted" aria-live="polite">
          {ready} of {SCAN_ANGLES.length} angles captured
        </p>
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold tracking-[0.14em] text-brand-on-dark uppercase">
            Angle {angleIndex + 1} of {SCAN_ANGLES.length}
          </p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 font-display text-[30px] leading-[1.1] font-medium text-on-dark outline-none md:text-[40px]"
          >
            {ANGLE_LABEL[angle]}
          </h1>
          <p className="mt-2 max-w-xl text-on-dark-muted">{ANGLE_TIPS[angle]}</p>

          {/* viewfinder */}
          <div className="relative mt-5 aspect-[4/3] w-full overflow-hidden rounded-3xl bg-black ring-1 ring-white/15">
            <video
              ref={videoRef}
              playsInline
              muted
              className={cn(
                'absolute inset-0 size-full object-cover',
                camera === 'live' && !shot ? 'opacity-100' : 'opacity-0',
                facing === 'user' && '-scale-x-100',
              )}
            />
            {shot ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview, never uploaded
              <img
                src={shot.url}
                alt={`${ANGLE_LABEL[angle]} capture preview`}
                className="absolute inset-0 size-full object-cover"
              />
            ) : null}
            {!shot ? (
              <div className={cn('absolute inset-0', camera !== 'live' && styles.grid)}>
                <AngleGuide angle={angle} className="absolute inset-0 m-auto h-full max-h-full w-auto" />
                {camera === 'live' ? <span className={styles.scanLine} aria-hidden /> : null}
              </div>
            ) : null}
            {flash ? <div className="absolute inset-0 bg-white/70" aria-hidden /> : null}

            {!shot && camera !== 'live' ? (
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-black/85 to-transparent p-4 pt-10 text-center">
                {camera === 'unavailable' ? (
                  <p className="flex items-center gap-1.5 text-sm text-on-dark">
                    <CameraOff className="size-4" aria-hidden />
                    Camera not available — upload a photo instead.
                  </p>
                ) : (
                  <p className="text-sm text-on-dark-muted">Allow camera access when your browser asks.</p>
                )}
              </div>
            ) : null}
            {shot ? (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[12px] text-on-dark">
                <Check className="size-3.5" aria-hidden />
                Captured · {shot.kb} KB · stays on this device
              </span>
            ) : null}
          </div>

          {/* controls */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {shot ? (
              <>
                <button
                  type="button"
                  onClick={() => onRetake(angle)}
                  className="inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm font-medium text-on-dark ring-1 ring-white/25 hover:bg-white/10"
                >
                  <RotateCcw className="size-4" aria-hidden />
                  Retake
                </button>
                {ready < SCAN_ANGLES.length ? (
                  <button
                    type="button"
                    onClick={() => goTo(SCAN_ANGLES.findIndex((a) => !shots[a]))}
                    className="bg-silver inline-flex h-12 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-obsidian hover:opacity-95"
                  >
                    Next angle
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                ) : null}
              </>
            ) : camera === 'live' ? (
              <>
                <button
                  type="button"
                  onClick={() => void capture()}
                  disabled={busy}
                  className="bg-silver inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-semibold text-obsidian hover:opacity-95 disabled:opacity-70 sm:flex-none"
                >
                  {busy ? (
                    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                  ) : (
                    <Camera className="size-4" aria-hidden />
                  )}
                  Capture {ANGLE_LABEL[angle].toLowerCase()}
                </button>
                <button
                  type="button"
                  onClick={() => void start(facing === 'user' ? 'environment' : 'user')}
                  className="inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm text-on-dark ring-1 ring-white/25 hover:bg-white/10"
                >
                  <SwitchCamera className="size-4" aria-hidden />
                  <span className="sr-only sm:not-sr-only">Switch camera</span>
                </button>
              </>
            ) : camera !== 'unavailable' ? (
              <button
                type="button"
                onClick={() => void start(DEFAULT_FACING[angle])}
                disabled={camera === 'starting'}
                className="bg-silver inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-semibold text-obsidian hover:opacity-95 disabled:opacity-70 sm:flex-none"
              >
                {camera === 'starting' ? (
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
                ) : (
                  <Camera className="size-4" aria-hidden />
                )}
                Turn on camera
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void start(DEFAULT_FACING[angle])}
                className="inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm text-on-dark ring-1 ring-white/25 hover:bg-white/10"
              >
                <RefreshCcw className="size-4" aria-hidden />
                Try camera again
              </button>
            )}
            {!shot ? (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="inline-flex h-12 items-center gap-2 rounded-xl px-4 text-sm text-on-dark ring-1 ring-white/25 hover:bg-white/10 disabled:opacity-60"
              >
                <ImageUp className="size-4" aria-hidden />
                Upload a photo
              </button>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              tabIndex={-1}
              aria-hidden
              onChange={(e) => {
                void upload(e.currentTarget.files?.[0]);
                e.currentTarget.value = '';
              }}
            />
          </div>
          <p aria-live="assertive" className="mt-2 min-h-5 text-sm text-[#ffb4a8]">
            {error}
          </p>
        </div>

        {/* angle checklist */}
        <aside className="lg:pt-10">
          <ol className="grid grid-cols-2 gap-2 lg:grid-cols-1">
            {SCAN_ANGLES.map((a, i) => {
              const s = shots[a];
              const active = i === angleIndex;
              return (
                <li key={a}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active ? 'step' : undefined}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl p-2.5 text-left ring-1 transition-colors',
                      active ? 'bg-white/12 ring-white/50' : 'bg-white/5 ring-white/10 hover:ring-white/25',
                    )}
                  >
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
                      {s ? (
                        // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                        <img src={s.url} alt="" className="size-full object-cover" />
                      ) : (
                        <AngleGuide angle={a} className="size-full" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-on-dark">
                        {ANGLE_LABEL[a]}
                      </span>
                      <span className={cn('block text-[12px]', s ? 'text-platinum' : 'text-on-dark-muted')}>
                        {s ? 'Captured' : active ? 'Now' : 'To do'}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            disabled={ready < SCAN_ANGLES.length}
            onClick={() => {
              stop();
              onDone();
            }}
            className="bg-silver mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-obsidian hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ScanLine className="size-4" aria-hidden />
            Analyse my scan
          </button>
          {ready < SCAN_ANGLES.length ? (
            <p className="mt-2 text-center text-[12px] text-on-dark-muted">
              Capture all four angles to continue.
            </p>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------

function Analysing({
  answers,
  angles,
  preview,
  headingRef,
  onDone,
  onBack,
}: {
  answers: ScanAnswers;
  angles: ScanAngle[];
  preview: string | null;
  headingRef: React.Ref<HTMLHeadingElement>;
  onDone: () => void;
  onBack: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<'pending' | 'ok' | { error: string }>('pending');
  const [attempt, setAttempt] = useState(0);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // Server computes and stores the (simulated) result while the staged animation runs.
  useEffect(() => {
    let cancelled = false;
    void submitScanAction({ answers, angles })
      .then((res) => {
        if (cancelled) return;
        setResult(res.ok ? 'ok' : { error: res.error.message });
      })
      .catch(() => {
        if (!cancelled) setResult({ error: 'We could not reach the server. Please try again.' });
      });
    return () => {
      cancelled = true;
    };
  }, [answers, angles, attempt]);

  useEffect(() => {
    const started = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(100, ((t - started) / ANALYSIS_MS) * 100);
      setProgress(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [attempt]);

  useEffect(() => {
    if (progress >= 100 && result === 'ok') onDoneRef.current();
  }, [progress, result]);

  const stage = Math.min(STAGES.length - 1, Math.floor((progress / 100) * STAGES.length));
  const failed = typeof result === 'object';

  return (
    <section
      className="mx-auto flex max-w-2xl flex-col items-center text-center"
      aria-live="polite"
      aria-busy={!failed}
    >
      <div className="relative">
        <ProgressRing
          value={progress}
          size={232}
          stroke={6}
          tone="dark"
          label={`Analysis ${Math.round(progress)}% done`}
        >
          <div className="relative size-[184px] overflow-hidden rounded-full bg-black ring-1 ring-white/10">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img src={preview} alt="" className="size-full object-cover opacity-60 grayscale" />
            ) : (
              <AngleGuide angle="closeup" className="size-full" />
            )}
            <div className={cn('absolute inset-0', styles.grid)} aria-hidden />
            <span className={styles.scanLine} aria-hidden />
          </div>
        </ProgressRing>
      </div>
      <p className="price mt-6 text-sm text-platinum">{Math.round(progress)}%</p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 font-display text-[30px] leading-[1.1] font-medium text-on-dark outline-none md:text-[40px]"
      >
        Analysing scalp &amp; hair roots
      </h1>
      <ol className="mt-6 w-full max-w-sm space-y-2.5 text-left">
        {STAGES.map((s, i) => {
          const done = progress >= 100 || i < stage;
          const active = i === stage && progress < 100;
          return (
            <li key={s} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full ring-1',
                  done
                    ? 'bg-platinum text-obsidian ring-platinum'
                    : active
                      ? 'ring-white/60'
                      : 'ring-white/15',
                )}
              >
                {done ? (
                  <Check className="size-3.5" aria-hidden />
                ) : active ? (
                  <span className={cn('size-2 rounded-full bg-on-dark', styles.pulse)} aria-hidden />
                ) : null}
              </span>
              <span className={cn(done || active ? 'text-on-dark' : 'text-on-dark-muted')}>
                {s}
                {done ? <span className="sr-only"> (done)</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
      {progress >= 100 && result === 'pending' ? (
        <p className="mt-5 flex items-center gap-2 text-sm text-on-dark-muted">
          <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
          Preparing your assessment…
        </p>
      ) : null}
      {failed ? (
        <div
          role="alert"
          className="mt-6 w-full max-w-sm rounded-2xl bg-white/5 p-4 text-left ring-1 ring-white/15"
        >
          <p className="flex items-center gap-2 text-sm font-medium text-on-dark">
            <AlertCircle className="size-4" aria-hidden />
            {result.error}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setResult('pending');
                setProgress(0);
                setAttempt((a) => a + 1);
              }}
              className="bg-silver inline-flex h-11 items-center rounded-xl px-4 text-sm font-semibold text-obsidian"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 items-center rounded-xl px-4 text-sm text-on-dark ring-1 ring-white/25"
            >
              Back to capture
            </button>
          </div>
        </div>
      ) : null}
      <p className="mt-8 text-[13px] text-on-dark-muted">
        Demo analysis — your doctor makes the final assessment.
      </p>
    </section>
  );
}

function BackButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-1 inline-flex min-h-11 items-center gap-1.5 px-1 text-sm text-on-dark-muted hover:text-on-dark"
    >
      <ArrowLeft className="size-4" aria-hidden />
      {children}
    </button>
  );
}
