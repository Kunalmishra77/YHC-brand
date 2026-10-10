'use client';

import {
  CalendarCheck,
  Camera,
  Check,
  MessageSquareText,
  Mic,
  PhoneOff,
  Stethoscope,
  UserRound,
  Video,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { CLINICAL } from '@/lib/images';
import { cn } from '@/lib/utils';
import type { SlotTerms, StepVisualId } from './types';

/*
 * Decorative UI vignettes for the "How it works" steps. Fixed-size compositions (~320×340) on obsidian,
 * scaled down by the parent on phones. All are aria-hidden by their containers; nothing here is a real
 * screen, result or person. Animations are transform/opacity only and run only while `active`.
 */

const EASE = [0.2, 0.7, 0.2, 1] as const;

interface VisualProps {
  active: boolean;
  /** Reduced motion: show the end state, no loops. */
  still?: boolean;
}

export function StepVisual({
  id,
  active,
  terms,
  still = false,
}: {
  id: StepVisualId;
  active: boolean;
  terms: SlotTerms;
  still?: boolean;
}) {
  switch (id) {
    case 'details':
      return <DetailsVisual active={active} still={still} />;
    case 'scan':
      return <ScanStepVisual active={active} still={still} />;
    case 'assessment':
      return <AssessmentVisual active={active} still={still} />;
    case 'health':
      return <HealthVisual active={active} still={still} />;
    case 'slot':
      return <SlotVisual active={active} still={still} terms={terms} />;
    case 'consult':
      return <ConsultVisual active={active} still={still} />;
    case 'followup':
      return <FollowUpVisual active={active} still={still} />;
  }
}

const tr = (still: boolean | undefined, delay = 0, duration = 0.5) =>
  still ? { duration: 0 } : { duration, delay, ease: EASE };

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[340px] w-[176px] rounded-[2.1rem] border border-graphite bg-ink-2 p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">
      <div className="relative h-full overflow-hidden rounded-[1.65rem] bg-obsidian">
        <span className="absolute top-2 left-1/2 z-20 h-1.5 w-12 -translate-x-1/2 rounded-full bg-graphite" />
        {children}
      </div>
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'w-[320px] rounded-3xl border border-line-dark bg-ink-2/90 p-5 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.16em] text-brand-on-dark uppercase">{children}</p>
  );
}

/* 1 · Basic details ------------------------------------------------------------------------------ */
function DetailsVisual({ active, still }: VisualProps) {
  const fields = [
    { label: 'Name', w: '70%' },
    { label: 'Mobile', w: '58%' },
    { label: 'Address', w: '84%' },
  ];
  return (
    <Phone>
      <div className="flex h-full flex-col px-4 pt-9 pb-4">
        <Kicker>Step 1 of 7</Kicker>
        <p className="mt-1.5 text-[18px] leading-tight font-semibold text-on-dark">Your details</p>
        <div className="mt-5 space-y-3.5">
          {fields.map((f, i) => (
            <div key={f.label}>
              <p className="text-[10px] text-on-dark-muted">{f.label}</p>
              <div className="mt-1 flex h-8 items-center rounded-lg border border-line-dark bg-ink-2 px-2.5">
                <motion.span
                  className="block h-1.5 origin-left rounded-full bg-platinum/70"
                  style={{ width: f.w }}
                  initial={false}
                  animate={{ scaleX: active ? 1 : 0 }}
                  transition={tr(still, 0.25 + i * 0.45, 0.6)}
                />
              </div>
            </div>
          ))}
        </div>
        <motion.div
          className="mt-auto flex h-9 items-center justify-center rounded-full bg-[image:var(--yhc-silver)] text-[12px] font-semibold text-obsidian"
          initial={false}
          animate={{ opacity: active ? 1 : 0.35 }}
          transition={tr(still, 1.7)}
        >
          Continue
        </motion.div>
      </div>
    </Phone>
  );
}

/* 2 · 3D scalp scan — app-style flow (client reference: progress dashes, head zone, magnified scalp) - */
const HEAD_SIDE =
  'M30 6 C15 6 7 17 7 30 C7 38 10 42 9 46 L5 52 L10 54 L10 60 C10 64 14 66 19 65 L21 72 L40 72 L40 60 C48 56 52 46 52 31 C52 15 44 6 30 6 Z';

function HeadIcon({
  view,
  active,
  still,
}: {
  view: 'left' | 'top' | 'right';
  active: boolean;
  still?: boolean;
}) {
  const dot = view === 'top' ? { cx: 30, cy: 30 } : { cx: view === 'left' ? 36 : 24, cy: 16 };
  const on = view === 'top';
  return (
    <svg viewBox="0 0 60 76" className="h-12 w-10">
      {view === 'top' ? (
        <g fill="#f4f4f2" stroke="#8e939a" strokeWidth="1.5">
          <ellipse cx="9" cy="40" rx="4" ry="7" />
          <ellipse cx="51" cy="40" rx="4" ry="7" />
          <ellipse cx="30" cy="38" rx="21" ry="28" />
        </g>
      ) : (
        <path
          d={HEAD_SIDE}
          fill="#f4f4f2"
          stroke="#8e939a"
          strokeWidth="1.5"
          transform={view === 'right' ? 'translate(60 0) scale(-1 1)' : undefined}
        />
      )}
      {on ? (
        <motion.circle
          cx={dot.cx}
          cy={dot.cy}
          r="9"
          fill="#4e6378"
          fillOpacity="0.25"
          initial={false}
          animate={active && !still ? { scale: [1, 1.5, 1], opacity: [1, 0.4, 1] } : { scale: 1, opacity: 1 }}
          transition={active && !still ? { duration: 1.8, repeat: Infinity } : { duration: 0 }}
          style={{ transformBox: 'fill-box', originX: 0.5, originY: 0.5 }}
        />
      ) : null}
      <circle cx={dot.cx} cy={dot.cy} r="4" fill={on ? '#16181b' : '#c9ccd1'} />
    </svg>
  );
}

function ScanStepVisual({ active, still }: VisualProps) {
  const img = CLINICAL.scalpParting;
  return (
    <div className="relative flex w-[360px] items-center justify-center">
      {/* Camera view (behind) */}
      <div className="relative -mr-10 translate-y-4 -rotate-3 opacity-90">
        <Phone>
          <Image
            src={CLINICAL.scalpPartingPortrait.src}
            alt=""
            fill
            sizes="180px"
            className="scale-125 object-cover grayscale"
          />
          <div className="absolute inset-0 bg-obsidian/25" />
          <svg viewBox="0 0 160 324" className="absolute inset-0 size-full" preserveAspectRatio="none">
            <path
              d="M38 110 V94 H54 M106 94 H122 V110 M122 214 V230 H106 M54 230 H38 V214"
              fill="none"
              stroke="#f2f2f0"
              strokeWidth="2"
            />
          </svg>
          <motion.div
            className="absolute inset-x-9 top-[100px] h-px bg-on-dark shadow-[0_0_16px_3px_rgba(174,187,200,0.6)]"
            initial={false}
            animate={active && !still ? { y: [0, 120, 0] } : { y: 60 }}
            transition={
              active && !still ? { duration: 3, ease: 'easeInOut', repeat: Infinity } : { duration: 0 }
            }
          />
          <span className="absolute bottom-5 left-1/2 size-12 -translate-x-1/2 rounded-full border-[3px] border-on-dark" />
          <span className="absolute right-3 bottom-8 rounded-full bg-obsidian/70 px-2.5 py-1 text-[10px] text-on-dark">
            Done
          </span>
        </Phone>
      </div>

      {/* Guidance screen (front) */}
      <div className="relative z-10">
        <div className="relative h-[340px] w-[176px] rounded-[2.1rem] border border-graphite bg-ink-2 p-2 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.85)]">
          <div className="relative flex h-full flex-col overflow-hidden rounded-[1.65rem] bg-card">
            <span className="absolute top-2 left-1/2 z-20 h-1.5 w-12 -translate-x-1/2 rounded-full bg-obsidian" />
            <div className="flex justify-center gap-1 pt-7">
              {[0, 1, 2, 3].map((i) => (
                <motion.span
                  key={i}
                  className={cn('h-1 rounded-full', i === 0 ? 'w-6 bg-obsidian' : 'w-3 bg-line')}
                  initial={false}
                  animate={{ opacity: active || i > 0 ? 1 : 0.4 }}
                  transition={tr(still, 0.2)}
                />
              ))}
            </div>
            <div className="flex items-baseline justify-between px-3.5 pt-3">
              <p className="text-[9px] text-muted-foreground">Scan 1 of 4</p>
              <p className="text-[9px] font-medium text-brand">How to scan</p>
            </div>
            <p className="px-3.5 pt-0.5 text-[18px] leading-tight font-semibold text-ink">Crown</p>
            <div className="flex justify-between px-3 pt-1.5">
              <HeadIcon view="left" active={active} still={still} />
              <HeadIcon view="top" active={active} still={still} />
              <HeadIcon view="right" active={active} still={still} />
            </div>
            <div className="relative mt-2 h-[104px] overflow-hidden">
              <Image src={img.src} alt="" fill sizes="180px" className="scale-150 object-cover grayscale" />
              <motion.div
                className="absolute inset-0 bg-card"
                initial={false}
                animate={{ opacity: active ? 0 : 0.6 }}
                transition={tr(still, 0.3, 0.8)}
              />
              <span className="absolute top-1.5 left-2 rounded-full bg-obsidian/70 px-1.5 py-0.5 text-[8px] text-on-dark">
                Magnified
              </span>
            </div>
            <div className="mt-auto space-y-1.5 px-3.5 pb-4">
              <span className="mx-auto flex h-7 w-20 items-center justify-center gap-1 rounded-full border border-obsidian text-[10px] font-medium text-ink">
                <Camera className="size-3" /> Scan
              </span>
              <span className="flex h-8 items-center justify-center rounded-full bg-obsidian text-[11px] font-semibold text-on-dark">
                Next
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 3 · Personalised assessment -------------------------------------------------------------------- */
function AssessmentVisual({ active, still }: VisualProps) {
  const rings = [
    { r: 52, to: 0.78, label: 'Roots' },
    { r: 40, to: 0.6, label: 'Spread' },
    { r: 28, to: 0.7, label: 'Scalp' },
  ];
  const outcomes = [
    { icon: Check, word: 'Suitable' },
    { icon: Stethoscope, word: 'Needs a doctor’s review' },
    { icon: X, word: 'Not suitable — we tell you why' },
  ];
  return (
    <Card>
      <Kicker>Personalised assessment</Kicker>
      <div className="mt-3 flex items-center gap-5">
        <svg viewBox="0 0 128 128" className="size-[118px] shrink-0 -rotate-90">
          {rings.map((ring, i) => (
            <g key={ring.label}>
              <circle cx="64" cy="64" r={ring.r} fill="none" stroke="#2a2d31" strokeWidth="7" />
              <motion.circle
                cx="64"
                cy="64"
                r={ring.r}
                fill="none"
                stroke={i === 0 ? '#e6e7e9' : i === 1 ? '#aebbc8' : '#8e939a'}
                strokeWidth="7"
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: active ? ring.to : 0 }}
                transition={tr(still, 0.2 + i * 0.25, 1.1)}
              />
            </g>
          ))}
        </svg>
        <ul className="space-y-2 text-[12px] text-on-dark-muted">
          {rings.map((ring, i) => (
            <li key={ring.label} className="flex items-center gap-2">
              <span
                className={cn(
                  'size-2 rounded-full',
                  i === 0 ? 'bg-mist' : i === 1 ? 'bg-brand-on-dark' : 'bg-steel',
                )}
              />
              {ring.label}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-[10px] tracking-[0.12em] text-on-dark-muted uppercase">Possible outcomes</p>
      <ul className="mt-2 space-y-1.5">
        {outcomes.map((o, i) => {
          const Icon = o.icon;
          return (
            <motion.li
              key={o.word}
              className="flex items-center gap-2.5 rounded-xl border border-line-dark bg-obsidian/60 px-3 py-2 text-[12px] text-on-dark"
              initial={false}
              animate={{ opacity: active ? 1 : 0, x: active ? 0 : 12 }}
              transition={tr(still, 0.9 + i * 0.15)}
            >
              <Icon className="size-3.5 shrink-0 text-brand-on-dark" />
              {o.word}
            </motion.li>
          );
        })}
      </ul>
      <p className="mt-3 text-[10px] text-steel">Demo · final assessment by the doctor</p>
    </Card>
  );
}

/* 4 · Health form -------------------------------------------------------------------------------- */
function HealthVisual({ active, still }: VisualProps) {
  const items = ['Medical history', 'Current medicines', 'Lifestyle & diet', 'Family history'];
  return (
    <Card>
      <Kicker>Health form</Kicker>
      <p className="mt-1.5 text-[18px] leading-tight font-semibold text-on-dark">For your doctor</p>
      <ul className="mt-4 space-y-2">
        {items.map((label, i) => (
          <li
            key={label}
            className="flex items-center gap-3 rounded-xl border border-line-dark bg-obsidian/60 px-3 py-2.5"
          >
            <span className="relative flex size-5 shrink-0 items-center justify-center rounded-md border border-steel/60">
              <motion.span
                className="absolute inset-0 flex items-center justify-center rounded-md bg-[image:var(--yhc-silver)]"
                initial={false}
                animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
                transition={tr(still, 0.3 + i * 0.35, 0.35)}
              >
                <Check className="size-3.5 text-obsidian" strokeWidth={3} />
              </motion.span>
            </span>
            <span className="text-[13px] text-on-dark">{label}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-graphite">
        <motion.div
          className="h-full origin-left rounded-full bg-[image:var(--yhc-silver)]"
          initial={false}
          animate={{ scaleX: active ? 1 : 0 }}
          transition={tr(still, 0.3, 1.6)}
        />
      </div>
      <p className="mt-2 text-[10px] text-steel">Read by your doctor before you meet</p>
    </Card>
  );
}

/* 5 · Doctor slot -------------------------------------------------------------------------------- */
function SlotVisual({ active, still, terms }: VisualProps & { terms: SlotTerms }) {
  const offset = 3;
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const available = new Set([8, 9, 11, 14, 15, 16, 18, 21, 22, 23]);
  const picked = 15;
  const times = ['10:30', '12:00', '17:30'];
  return (
    <Card>
      <div className="flex items-baseline justify-between">
        <Kicker>Choose a slot</Kicker>
        <span className="text-[10px] text-steel">Illustrative times</span>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] text-steel">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`e${i}`} />
        ))}
        {days.map((d) => (
          <span
            key={d}
            className={cn(
              'relative flex h-6 items-center justify-center rounded-md text-[11px]',
              available.has(d) ? 'text-on-dark' : 'text-steel/60',
            )}
          >
            {d === picked ? (
              <motion.span
                className="absolute inset-0 rounded-md bg-[image:var(--yhc-silver)]"
                initial={false}
                animate={{ scale: active ? 1 : 0.4, opacity: active ? 1 : 0 }}
                transition={tr(still, 0.35, 0.4)}
              />
            ) : null}
            <span className={cn('relative', d === picked && active && 'font-semibold text-obsidian')}>
              {d}
            </span>
            {available.has(d) && d !== picked ? (
              <span className="absolute bottom-0.5 size-0.5 rounded-full bg-brand-on-dark" />
            ) : null}
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {times.map((t, i) => (
          <motion.span
            key={t}
            className={cn(
              'price flex-1 rounded-full border py-1.5 text-center text-[11px]',
              i === 1 ? 'border-platinum text-on-dark' : 'border-line-dark text-on-dark-muted',
            )}
            initial={false}
            animate={{ opacity: active ? 1 : 0, y: active ? 0 : 6 }}
            transition={tr(still, 0.7 + i * 0.1)}
          >
            {t}
          </motion.span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-line-dark pt-3 text-[12px]">
        <span className="flex items-center gap-1.5 text-on-dark-muted">
          <CalendarCheck className="size-3.5" />
          {terms.slotMinutes}-min video consultation
        </span>
        <span className="price text-on-dark">{terms.fee}</span>
      </div>
    </Card>
  );
}

/* 6 · Video consultation & plan ------------------------------------------------------------------ */
function ConsultVisual({ active, still }: VisualProps) {
  return (
    <div className="relative w-[330px] pb-16">
      <div className="relative h-[196px] overflow-hidden rounded-3xl border border-line-dark bg-[radial-gradient(ellipse_at_50%_40%,#3a3d42,#1c1e21_70%)]">
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-obsidian/70 px-2.5 py-1 text-[10px] text-on-dark">
          <motion.span
            className="size-1.5 rounded-full bg-on-dark"
            initial={false}
            animate={active && !still ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
            transition={active && !still ? { duration: 1.6, repeat: Infinity } : { duration: 0 }}
          />
          Video consultation
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <span className="flex size-16 items-center justify-center rounded-full border border-platinum/40 bg-graphite">
            <Stethoscope className="size-7 text-platinum" />
          </span>
          <span className="text-[11px] text-on-dark-muted">Your doctor</span>
        </div>
        <div className="absolute right-3 bottom-12 flex h-16 w-12 items-center justify-center rounded-xl border border-line-dark bg-obsidian">
          <UserRound className="size-5 text-steel" />
        </div>
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
          {[Mic, Video, PhoneOff].map((Icon, i) => (
            <span
              key={i}
              className={cn(
                'flex size-7 items-center justify-center rounded-full',
                i === 2 ? 'bg-on-dark text-obsidian' : 'bg-obsidian/80 text-on-dark',
              )}
            >
              <Icon className="size-3.5" />
            </span>
          ))}
        </div>
      </div>
      <motion.div
        className="absolute right-[-14px] bottom-0 w-[214px] rounded-2xl border border-platinum/30 bg-ink-2 p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)]"
        initial={false}
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 24 }}
        transition={tr(still, 0.6, 0.6)}
      >
        <Kicker>Your plan</Kicker>
        <p className="mt-1 text-[12px] text-on-dark">Prescribed by your doctor</p>
        <div className="mt-3 space-y-1.5">
          {['82%', '64%', '74%'].map((w) => (
            <span key={w} className="block h-1.5 rounded-full bg-graphite" style={{ width: w }} />
          ))}
        </div>
        <p className="mt-3 text-[10px] text-steel">Only if treatment is right for you</p>
      </motion.div>
    </div>
  );
}

/* 7 · Follow-up ---------------------------------------------------------------------------------- */
function FollowUpVisual({ active, still }: VisualProps) {
  const items = [
    { icon: MessageSquareText, title: 'Check-in', body: 'How is your routine going?' },
    { icon: Camera, title: 'Photo update', body: 'Same light, same angles' },
    { icon: CalendarCheck, title: 'Follow-up review', body: 'Your plan adjusted with the doctor' },
  ];
  return (
    <div className="relative w-[300px]">
      <span className="absolute top-6 bottom-6 left-[22px] w-px bg-line-dark" />
      <ul className="space-y-4">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <motion.li
              key={it.title}
              className="relative flex items-start gap-4"
              initial={false}
              animate={{ opacity: active ? 1 : 0, y: active ? 0 : 14 }}
              transition={tr(still, 0.2 + i * 0.35)}
            >
              <span
                className={cn(
                  'relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border',
                  i === 2
                    ? 'border-transparent bg-[image:var(--yhc-silver)] text-obsidian'
                    : 'border-line-dark bg-ink-2 text-platinum',
                )}
              >
                <Icon className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1 rounded-2xl border border-line-dark bg-ink-2/90 px-4 py-3">
                <p className="text-[13px] font-semibold text-on-dark">{it.title}</p>
                <p className="mt-0.5 text-[12px] text-on-dark-muted">{it.body}</p>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
