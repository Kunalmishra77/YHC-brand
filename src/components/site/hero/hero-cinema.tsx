'use client';

import { ArrowRight } from 'lucide-react';
import { type MotionValue, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { HeroStartForm } from '@/components/journey/hero-start-form';
import { useRamp } from '@/lib/use-ramp';
import { cn } from '@/lib/utils';
import { HERO_ACTS, HERO_FILM, HERO_HEADLINE, HERO_LINE } from './hero-acts';

/*
 * Desktop scroll-story hero (lg+, motion allowed — docs/21, ADR-35). A 260svh section with a sticky
 * one-screen stage. The client's bottle film (V01, seamless forward/back loop) fills the screen:
 *   0 – 0.14   headline left, start form right, the bottle between them;
 *   0.14 – 1   three pinned acts — a giant serif word each, a 01/02/03 index — with H01 and H13 fading in
 *              over the film for acts 1 and 2, and the bottle returning for act 3.
 * Only opacity/transform animate (compositor-only) so scrolling stays smooth; the film pauses while it
 * is covered or off screen.
 */

/** Opacity for act i's giant word (in, hold, out — the last act stays). */
const ACT_RANGES: Array<[number, number, number, number]> = [
  [0.15, 0.21, 0.38, 0.43],
  [0.45, 0.5, 0.64, 0.69],
  [0.71, 0.77, 2, 2],
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress: p } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  // Screen 1 lifts away.
  const introOpacity = useRamp(p, [0.03, 0.12], [1, 0]);
  const introY = useRamp(p, [0, 0.14], [0, -56]);
  const formOpacity = useRamp(p, [0.03, 0.11], [1, 0]);
  const formY = useRamp(p, [0, 0.12], [0, -32]);
  const ctaOpacity = useRamp(p, [0.12, 0.18], [0, 1]);
  const indexOpacity = useRamp(p, [0.13, 0.19], [0, 1]);

  // The film eases back a touch as the story starts, then forward again for act 3.
  const filmScale = useRamp(p, [0, 0.14, 0.7, 1], [1, 1.08, 1.08, 1]);

  // Pictures over the film.
  const h01Opacity = useRamp(p, [0.12, 0.2, 0.42, 0.48], [0, 1, 1, 0]);
  const h01Scale = useRamp(p, [0.12, 0.48], [1.08, 1]);
  const h13Opacity = useRamp(p, [0.42, 0.48, 0.66, 0.72], [0, 1, 1, 0]);
  const h13Scale = useRamp(p, [0.42, 0.72], [1.08, 1]);

  const wordOpacity = [useActOpacity(p, 0), useActOpacity(p, 1), useActOpacity(p, 2)] as const;
  const wordY = [
    useRamp(wordOpacity[0], [0, 1], [40, 0]),
    useRamp(wordOpacity[1], [0, 1], [40, 0]),
    useRamp(wordOpacity[2], [0, 1], [40, 0]),
  ] as const;

  // Which part of the story is on screen: 0 = intro (form), 1–3 = acts.
  const [stage, setStage] = useState(0);
  const [formLive, setFormLive] = useState(true);
  const [onScreen, setOnScreen] = useState(true);
  const covered = useRef(false);

  const syncVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    if (onScreen && !covered.current) void v.play().catch(() => undefined);
    else v.pause();
  };

  useMotionValueEvent(p, 'change', (v) => {
    setStage(v < 0.15 ? 0 : v < 0.45 ? 1 : v < 0.71 ? 2 : 3);
    setFormLive(v < 0.06);
    const next = v > 0.2 && v < 0.66; // fully hidden behind H01/H13
    if (next !== covered.current) {
      covered.current = next;
      syncVideo();
    }
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(Boolean(e?.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(syncVideo, [onScreen]);

  const [act1, act2] = HERO_ACTS;
  if (!act1 || !act2) return null;

  return (
    <div ref={sectionRef} className="relative h-[260svh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-obsidian text-on-dark">
        {/* The film */}
        <motion.div aria-hidden className="absolute inset-0" style={{ scale: filmScale }}>
          <video
            ref={videoRef}
            className="size-full object-cover"
            src={HERO_FILM.src}
            poster={HERO_FILM.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </motion.div>

        {/* Act pictures */}
        <motion.div aria-hidden className="absolute inset-0" style={{ opacity: h01Opacity, scale: h01Scale }}>
          <Image src={act1.image.src} alt="" fill sizes="100vw" className="object-cover object-[60%_35%]" />
        </motion.div>
        <motion.div aria-hidden className="absolute inset-0" style={{ opacity: h13Opacity, scale: h13Scale }}>
          <Image src={act2.image.src} alt="" fill sizes="100vw" className="object-cover object-[70%_50%]" />
        </motion.div>

        {/* Static shading: words sit on the dark left, the form on the dark right, the bottle stays lit. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,19,21,0.9)_0%,rgba(18,19,21,0.55)_30%,rgba(18,19,21,0)_52%,rgba(18,19,21,0)_62%,rgba(18,19,21,0.6)_85%,rgba(18,19,21,0.8)_100%)]"
        />
        <div aria-hidden className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-obsidian/80 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />

        {note ? (
          <motion.span
            aria-hidden
            className="absolute right-8 bottom-28 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-on-dark xl:right-12"
            style={{ opacity: h01Opacity }}
          >
            {note}
          </motion.span>
        ) : null}

        {/* Screen 1: headline + trust chips (left) */}
        <motion.div
          className="absolute inset-y-0 left-8 z-10 flex w-[min(38%,34rem)] flex-col justify-center pt-16 xl:left-12"
          style={{ opacity: introOpacity, y: introY }}
        >
          <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-1000">
            <p className="eyebrow text-brand-on-dark">Doctor-led hair care</p>
            <h1
              id="hero-heading"
              className="mt-5 font-display text-[clamp(3rem,1.4rem+3vw,4.75rem)] leading-[1.02] font-medium text-balance text-on-dark"
            >
              {HERO_HEADLINE}
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-pretty text-on-dark-muted">{HERO_LINE}</p>
            <div className="mt-8">{trust}</div>
          </div>
        </motion.div>

        {/* Screen 1: the start form (right). Fades out and leaves the tab order as act 1 begins. */}
        <motion.div
          inert={!formLive}
          className="absolute inset-y-0 right-8 z-20 flex w-[360px] items-center pt-16 xl:right-12 xl:w-[392px]"
          style={{ opacity: formOpacity, y: formY }}
        >
          <div className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both w-full delay-300 duration-1000">
            <HeroStartForm className="w-full max-w-none bg-obsidian/75 backdrop-blur-none shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)]" />
          </div>
        </motion.div>

        {/* Acts: giant words (decorative — the index below carries the meaning once). */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[24%] z-10">
          {HERO_ACTS.map((act, i) => (
            <motion.p
              key={act.word}
              className="absolute top-0 left-8 max-w-[46vw] font-display text-[clamp(4.5rem,1rem+6.4vw,8.5rem)] leading-[0.92] font-medium tracking-[-0.02em] text-balance text-on-dark xl:left-12"
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

        {/* Scroll cue */}
        <motion.div
          aria-hidden
          className="absolute bottom-10 left-8 z-10 flex items-center gap-3 text-[11px] font-medium tracking-[0.2em] text-on-dark-muted uppercase xl:left-12"
          style={{ opacity: introOpacity }}
        >
          <span className="block h-10 w-px overflow-hidden bg-white/15">
            <span className="yhc-scroll-cue block h-1/2 w-px bg-on-dark" />
          </span>
          Scroll to see how it works
        </motion.div>
      </div>
    </div>
  );
}
