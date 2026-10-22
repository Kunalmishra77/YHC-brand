'use client';

import { ArrowRight } from 'lucide-react';
import {
  type MotionValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { HeroStartForm } from '@/components/journey/hero-start-form';
import { ScrollSequence } from '@/components/site/scroll-sequence';
import { useRamp } from '@/lib/use-ramp';
import { cn } from '@/lib/utils';
import { CausticLight } from './caustic-light';
import { GRAIN_URL, HERO_ACTS, HERO_HEADLINE, HERO_LINE } from './hero-acts';

/*
 * Desktop scroll-story hero (lg+, motion allowed — docs/21, after the dewlab template). A 300vh section
 * with a sticky one-screen stage:
 *   0 – 0.2   headline + trust chips left, the start form right, a rounded "window" on H01 between them;
 *   → 0.26    the window opens to full bleed, the form fades out, a compact start button appears;
 *   0.25 – 1  three pinned acts: a giant serif word per act, a small 01/02/03 index, the picture
 *             cross-fading H01 → H13 → P01; in act 3 the window closes again around the product.
 * Warm caustic light (WebGL) lives behind the window and shows wherever the window is not.
 */

type Rect = { t: number; r: number; b: number; l: number; radius: number };

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Ease-in-out so the window opens and closes like a camera move, not linearly. */
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const span = (v: number, a: number, b: number) => ease(clamp01((v - a) / (b - a)));

/** Window and product-card rectangles (insets from each stage edge, px) for a stage size. */
function layout(w: number, h: number) {
  const wide = w >= 1280;
  const gutter = wide ? 48 : 32;
  const formW = wide ? 400 : 360;
  const frame: Rect = {
    t: 92,
    b: 36,
    l: Math.round(w * (wide ? 0.36 : 0.34)),
    r: gutter + Math.round(formW * 0.45),
    radius: 36,
  };
  const cardH = Math.round(h * 0.64);
  const cardW = Math.round(cardH * 0.68);
  const cardT = Math.round(h * 0.15);
  const cardR = Math.round(w * 0.09);
  const card: Rect = { t: cardT, b: h - cardT - cardH, r: cardR, l: w - cardR - cardW, radius: 32 };
  return {
    frame,
    card,
    cardBox: { top: cardT, right: cardR, width: cardW, height: cardH },
    chip: { left: frame.l + 18, bottom: frame.b + 18 },
  };
}

const ZERO: Rect = { t: 0, r: 0, b: 0, l: 0, radius: 0 };
const mix = (a: Rect, b: Rect, k: number): Rect => ({
  t: lerp(a.t, b.t, k),
  r: lerp(a.r, b.r, k),
  b: lerp(a.b, b.b, k),
  l: lerp(a.l, b.l, k),
  radius: lerp(a.radius, b.radius, k),
});

/** Opacity for act i's giant word (in, hold, out — the last act stays). */
const ACT_RANGES: Array<[number, number, number, number]> = [
  [0.22, 0.3, 0.45, 0.5],
  [0.5, 0.56, 0.7, 0.75],
  [0.75, 0.81, 2, 2],
];

function useActOpacity(p: MotionValue<number>, i: number) {
  return useTransform(p, (v) => {
    const range = ACT_RANGES[i];
    if (!range) return 0;
    const [a, b, c, d] = range;
    if (v <= a || v >= d) return 0;
    if (v < b) return (v - a) / (b - a);
    if (v > c) return 1 - (v - c) / (d - c);
    return 1;
  });
}

export function HeroCinema({
  trust,
  note,
}: {
  /** Trust chips (server-rendered). */
  trust: React.ReactNode;
  /** "Illustrative image" chip text for H01, if needed. */
  note?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  // Stage geometry, kept in a motion value so the clip path updates on resize without re-rendering.
  const geo = useMotionValue(layout(1440, 900));
  const [boxes, setBoxes] = useState(() => {
    const g = geo.get();
    return { card: g.cardBox, chip: g.chip };
  });
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const next = layout(el.clientWidth, el.clientHeight);
      geo.set(next);
      setBoxes({ card: next.cardBox, chip: next.chip });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [geo]);

  // The window: framed → full bleed (0.06–0.26) → product card (0.7–0.82).
  const clip = useTransform(() => {
    const v = p.get();
    const { frame, card } = geo.get();
    const close = span(v, 0.7, 0.82);
    const r = close > 0 ? mix(ZERO, card, close) : mix(frame, ZERO, span(v, 0.06, 0.26));
    return `inset(${r.t}px ${r.r}px ${r.b}px ${r.l}px round ${r.radius}px)`;
  });

  // Screen 1 fades away as the window opens.
  const introOpacity = useRamp(p, [0.08, 0.2], [1, 0]);
  const introY = useRamp(p, [0.04, 0.22], [0, -48]);
  const formOpacity = useRamp(p, [0.05, 0.15], [1, 0]);
  const formY = useRamp(p, [0.05, 0.15], [0, 24]);
  const ctaOpacity = useRamp(p, [0.18, 0.26], [0, 1]);
  const indexOpacity = useRamp(p, [0.2, 0.28], [0, 1]);
  const scrim = useRamp(p, [0.12, 0.3], [0.15, 0.55]);

  // Pictures.
  const h01Opacity = useRamp(p, [0.46, 0.54], [1, 0]);
  const h01Scale = useRamp(p, [0, 0.5], [1.16, 1.02]);
  const h13Opacity = useRamp(p, [0.46, 0.54, 0.7, 0.78], [0, 1, 1, 0]);
  const h13Scale = useRamp(p, [0.44, 0.8], [1.14, 1]);
  const p01Opacity = useRamp(p, [0.7, 0.78], [0, 1]);
  const p01Scale = useRamp(p, [0.7, 1], [1.12, 1]);
  const filmProgress = useRamp(p, [0.75, 1], [0, 1]);

  const wordOpacity = [useActOpacity(p, 0), useActOpacity(p, 1), useActOpacity(p, 2)] as const;
  const wordY = [
    useRamp(wordOpacity[0], [0, 1], [36, 0]),
    useRamp(wordOpacity[1], [0, 1], [36, 0]),
    useRamp(wordOpacity[2], [0, 1], [36, 0]),
  ] as const;

  // Which part of the story is on screen: 0 = intro (form), 1–3 = acts.
  const [stage, setStage] = useState(0);
  const [formLive, setFormLive] = useState(true);
  useMotionValueEvent(p, 'change', (v) => {
    setStage(v < 0.24 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3);
    setFormLive(v < 0.1);
  });

  // Subtle mouse parallax on the picture.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(useTransform(mx, [-1, 1], [16, -16]), { stiffness: 60, damping: 20 });
  const py = useSpring(useTransform(my, [-1, 1], [10, -10]), { stiffness: 60, damping: 20 });
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    my.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const [act1, act2, act3] = HERO_ACTS;
  if (!act1 || !act2 || !act3) return null;

  return (
    <div ref={sectionRef} className="relative h-[300svh]">
      <div
        ref={stageRef}
        onPointerMove={onPointerMove}
        className="sticky top-0 h-svh overflow-hidden bg-obsidian text-on-dark"
      >
        <CausticLight />

        {/* The window. Pictures are laid out full-bleed and revealed by the clip path. */}
        <motion.div aria-hidden className="absolute inset-0 will-change-[clip-path]" style={{ clipPath: clip }}>
          <motion.div className="absolute -inset-6" style={{ x: px, y: py }}>
            <motion.div className="absolute inset-0" style={{ opacity: h01Opacity, scale: h01Scale }}>
              <div className="yhc-kenburns absolute inset-0">
                <Image
                  src={act1.image.src}
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover object-[60%_35%]"
                />
              </div>
            </motion.div>
            <motion.div className="absolute inset-0" style={{ opacity: h13Opacity, scale: h13Scale }}>
              <div className="yhc-kenburns absolute inset-0">
                <Image src={act2.image.src} alt="" fill sizes="100vw" className="object-cover object-[70%_50%]" />
              </div>
            </motion.div>
          </motion.div>
          {/* Product card (act 3): its own box, so the portrait pack is never cropped to a strip. */}
          <motion.div
            className="absolute overflow-hidden"
            style={{ ...boxes.card, opacity: p01Opacity, scale: p01Scale }}
          >
            <ScrollSequence
              name="hero"
              progress={filmProgress}
              poster={{ src: act3.image.src, alt: '' }}
              className="size-full"
            />
          </motion.div>
          {/* Darken towards the words. */}
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,19,21,0.92)_0%,rgba(18,19,21,0.55)_40%,rgba(18,19,21,0)_75%)]"
            style={{ opacity: scrim }}
          />
          {note ? (
            <motion.span
              className="absolute rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-on-dark backdrop-blur"
              style={{ ...boxes.chip, opacity: h01Opacity }}
            >
              {note}
            </motion.span>
          ) : null}
        </motion.div>

        {/* Film grain over everything visual. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-overlay"
          style={{ backgroundImage: GRAIN_URL }}
        />

        {/* Screen 1: headline + trust chips (left) */}
        <motion.div
          className="absolute inset-y-0 left-0 z-10 flex w-[46%] flex-col justify-center pt-16 pl-8 xl:w-[44%] xl:pl-12"
          style={{ opacity: introOpacity, y: introY }}
        >
          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-1000">
            <h1
              id="hero-heading"
              className="font-display text-[clamp(3rem,1.2rem+3.4vw,5.25rem)] leading-[1.02] font-medium text-balance text-on-dark [text-shadow:0_2px_30px_rgba(0,0,0,0.45)]"
            >
              {HERO_HEADLINE}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-pretty text-on-dark-muted">{HERO_LINE}</p>
            <div className="mt-9">{trust}</div>
          </div>
        </motion.div>

        {/* Screen 1: the start form (right). Fades out and leaves the tab order as act 1 begins. */}
        <motion.div
          inert={!formLive}
          className="absolute inset-y-0 right-8 z-20 flex w-[360px] items-center pt-16 xl:right-12 xl:w-[400px]"
          style={{ opacity: formOpacity, y: formY }}
        >
          <div className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both w-full delay-300 duration-1000">
            <HeroStartForm className="w-full max-w-none bg-obsidian/55 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.14)]" />
          </div>
        </motion.div>

        {/* Acts: giant words (decorative — the index below carries the meaning once). */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[22%] z-10">
          {HERO_ACTS.map((act, i) => (
            <motion.p
              key={act.word}
              className="absolute top-0 left-8 max-w-[54vw] font-display text-[clamp(4.5rem,1rem+7vw,9.5rem)] leading-[0.92] font-medium tracking-[-0.02em] text-balance text-on-dark xl:left-12"
              style={{ opacity: wordOpacity[i], y: wordY[i] }}
            >
              {act.word}
            </motion.p>
          ))}
        </div>

        {/* Act index (bottom left) */}
        <motion.ol
          aria-label="How it works"
          className="absolute bottom-10 left-8 z-10 flex max-w-[60vw] gap-8 xl:left-12 xl:gap-12"
          style={{ opacity: indexOpacity }}
        >
          {HERO_ACTS.map((act, i) => {
            const active = stage === i + 1;
            return (
              <li
                key={act.word}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'relative max-w-[15rem] border-t pt-4 transition-[opacity,border-color] duration-500',
                  active ? 'border-on-dark opacity-100' : 'border-white/20 opacity-50',
                )}
              >
                <span className="block text-xs font-medium tabular-nums text-on-dark-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="mt-1 block font-display text-2xl leading-tight text-on-dark">{act.word}</span>
                <span className="mt-1.5 block text-sm leading-snug text-on-dark-muted">{act.line}</span>
              </li>
            );
          })}
        </motion.ol>

        {/* Compact start button while the acts play */}
        <motion.div
          inert={stage === 0}
          className="absolute right-8 bottom-10 z-20 xl:right-12"
          style={{ opacity: ctaOpacity }}
        >
          <Link
            href="/start"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[image:var(--yhc-silver)] px-6 text-[15px] font-semibold text-obsidian shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] transition-transform hover:-translate-y-0.5 focus-visible:outline-on-dark"
          >
            Begin my free 3D scan
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
