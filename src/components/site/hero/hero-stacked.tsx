import { ArrowDown } from 'lucide-react';
import Image from 'next/image';
import { HeroStartForm } from '@/components/journey/hero-start-form';
import { illustrativeNote } from '@/components/site/slot-note';
import { SLOTS } from '@/lib/slots';
import { CausticLight } from './caustic-light';
import { GRAIN_URL, HERO_ACTS, HERO_HEADLINE, HERO_LINE } from './hero-acts';

const ENTER = 'animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both motion-reduce:animate-none';

/**
 * Phones, tablets and reduced motion (docs/21): no pinning. Headline, one line and a start button above
 * the fold (audit UX-05); then a rounded portrait of someone scanning (H02) with warm caustic light
 * behind it and a slow zoom; the start form over its lower edge; trust chips; and the three story acts
 * as swipe cards (a three-up grid on wide screens with reduced motion).
 */
export function HeroStacked({ trust }: { trust: React.ReactNode }) {
  const photo = SLOTS.H02;
  const note = illustrativeNote(photo);

  return (
    <div className="relative isolate overflow-hidden bg-obsidian text-on-dark">
      <CausticLight className="-z-10" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_URL }}
      />

      <div className="container-yhc grid gap-10 pt-24 pb-14 sm:pt-28 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center md:gap-10 lg:gap-16 lg:pb-20">
        <div className="max-w-xl">
          <h1
            id="hero-heading-stacked"
            className={`font-display text-[clamp(2.6rem,1.4rem+4.6vw,4.75rem)] leading-[1.03] font-medium text-balance text-on-dark ${ENTER} delay-100`}
          >
            {HERO_HEADLINE}
          </h1>
          <p className={`mt-5 max-w-md text-base leading-relaxed text-pretty text-on-dark-muted sm:text-lg ${ENTER} delay-200`}>
            {HERO_LINE}
          </p>
          <a
            href="#start-form"
            className={`mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[image:var(--yhc-silver)] text-[15px] font-semibold text-obsidian shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] focus-visible:outline-on-dark sm:w-auto sm:px-8 ${ENTER} delay-300`}
          >
            Begin my free 3D scan
            <ArrowDown className="size-4" aria-hidden />
          </a>
          <div className={`mt-8 hidden md:block ${ENTER} delay-500`}>{trust}</div>
        </div>

        {/* Portrait + form */}
        <div className="relative mx-auto w-full max-w-[440px]">
          {/* Warm light pooling behind the frame */}
          <div
            aria-hidden
            className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(237,168,100,0.32),rgba(153,176,199,0.12)_60%,transparent)] blur-2xl"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
            <div className="yhc-kenburns absolute inset-0">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                priority
                sizes="(min-width: 768px) 440px, 100vw"
                className="object-cover object-[50%_20%]"
              />
            </div>
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-obsidian/85 via-obsidian/10 to-transparent" />
            {note ? (
              <span className="absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-on-dark backdrop-blur">
                {note}
              </span>
            ) : null}
          </div>
          <div id="start-form" className="relative z-10 mx-auto -mt-28 w-[calc(100%-1.25rem)] scroll-mt-24">
            <HeroStartForm className="w-full max-w-none bg-obsidian/70 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]" />
          </div>
        </div>

        <div className="md:hidden">{trust}</div>
      </div>

      {/* The story, as swipe cards */}
      <div className="pb-16 lg:pb-24">
        <ol
          aria-label="How it works"
          tabIndex={0}
          className="container-yhc flex scroll-px-[var(--yhc-gutter)] snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
        >
          {HERO_ACTS.map((act, i) => {
            const portrait = act.image.height > act.image.width;
            const actNote = i === 0 ? illustrativeNote(act.image) : undefined;
            return (
              <li
                key={act.word}
                className="relative aspect-[4/5] w-[78%] shrink-0 snap-start overflow-hidden rounded-[28px] ring-1 ring-white/10 sm:w-[46%] md:w-[36%] lg:w-auto"
              >
                <Image
                  src={act.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 46vw, 78vw"
                  className={portrait ? 'object-cover object-[50%_35%]' : 'object-cover object-[68%_50%]'}
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/55 to-obsidian/0" />
                {actNote ? (
                  <span className="absolute top-4 right-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-on-dark backdrop-blur">
                    {actNote}
                  </span>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <span className="text-xs font-medium tabular-nums text-on-dark-muted">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-1 font-display text-[2.4rem] leading-[0.98] font-medium text-balance text-on-dark sm:text-5xl">
                    {act.word}
                  </p>
                  <p className="mt-3 text-sm leading-snug text-pretty text-on-dark-muted">{act.line}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
