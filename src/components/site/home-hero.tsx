import { ArrowDown, BadgeCheck, ShieldCheck, Stethoscope } from 'lucide-react';
import { getImageProps } from 'next/image';
import { HeroStartForm } from '@/components/journey/hero-start-form';
import { illustrativeNote } from '@/components/site/slot-note';
import { CLAIMS, doctorClaimLabel, verifiedPatent } from '@/lib/claims';
import { publicCredential } from '@/lib/credentials';
import { VIDEOS } from '@/lib/images';
import { SLOTS } from '@/lib/slots';
import { cn } from '@/lib/utils';
import { BackgroundVideo } from './background-video';
import { PatentSlot } from './patent-slot';

const ENTER =
  'animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both motion-reduce:animate-none';

/**
 * Trust-first hero (ADR-27, docs/20): a full-bleed picture of someone checking their scalp with a phone
 * (slot H01 on wide screens, H02 on phones) once the client's images are in; until then the laboratory
 * b-roll. The client-approved headline sits on the left, the glass "start" form on the right — below
 * the headline on mobile, with a primary action above the fold.
 */
export function HomeHero({
  doctorName,
  registrationNo,
  guaranteeOn,
}: {
  doctorName: string;
  registrationNo: string;
  guaranteeOn: boolean;
}) {
  const photo = SLOTS.H01.ready;
  const note = photo ? illustrativeNote(SLOTS.H01) : undefined;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate -mt-16 overflow-hidden bg-obsidian text-on-dark"
    >
      {photo ? (
        <HeroPhoto />
      ) : (
        <BackgroundVideo video={VIDEOS.hero} priority objectPosition="60% 50%" className="-z-20" />
      )}
      {/* Overlays for text contrast: an even veil, a directional fade and a bottom fade. The photo is
          composed dark on the left (desktop) and at the bottom (phone), so it needs a lighter veil. */}
      <div className={cn('absolute inset-0 -z-10', photo ? 'bg-obsidian/20' : 'bg-obsidian/45')} aria-hidden />
      <div
        className={cn(
          'absolute inset-0 -z-10 bg-gradient-to-b lg:bg-gradient-to-r',
          photo
            ? 'from-obsidian/30 via-obsidian/45 to-obsidian lg:from-obsidian/90 lg:via-obsidian/35 lg:to-obsidian/10'
            : 'from-obsidian/70 via-obsidian/50 to-obsidian lg:from-obsidian/95 lg:via-obsidian/55 lg:to-obsidian/30',
        )}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-obsidian to-transparent"
        aria-hidden
      />

      <div className="container-yhc grid items-center gap-10 pt-28 pb-14 sm:pt-32 lg:min-h-[100svh] lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14 lg:pt-32 lg:pb-24 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-16">
        <div className="max-w-[38rem]">
          <p className={cn('flex items-center gap-3 text-sm text-on-dark-muted delay-100', ENTER)}>
            <span className="h-px w-8 bg-platinum/60" aria-hidden />
            Doctor-led hair care
          </p>
          <h1
            id="hero-heading"
            className={cn(
              'display mt-6 text-[clamp(2.6rem,1.5rem+4.4vw,5.25rem)] leading-[1.02] text-balance text-on-dark delay-200',
              ENTER,
            )}
          >
            Hair care begins with science, not with products.
          </h1>
          <p
            className={cn(
              'mt-6 max-w-lg text-base leading-relaxed text-pretty text-on-dark-muted delay-300 sm:text-lg',
              ENTER,
            )}
          >
            First we scan your scalp. Then a doctor tells you if treatment will help.
          </p>

          {/* Mobile: a primary action above the fold (audit UX-05); the form sits below the trust list. */}
          <a
            href="#start-form"
            className="bg-silver mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-[15px] font-semibold text-obsidian shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] transition-opacity hover:opacity-95 sm:w-auto sm:px-8 lg:hidden"
          >
            Begin my free 3D scan
            <ArrowDown className="size-4" aria-hidden />
          </a>

          <ul
            className={cn(
              'mt-9 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-[13px] leading-snug text-on-dark-muted delay-500 sm:grid-cols-2',
              ENTER,
            )}
            aria-label="Why people trust us"
          >
            <li className="flex items-start gap-2">
              <Stethoscope className="mt-0.5 size-3.5 shrink-0 text-brand-on-dark" aria-hidden />
              {doctorClaimLabel()}
            </li>
            {guaranteeOn ? (
              <li className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-brand-on-dark" aria-hidden />
                Money-back guarantee (conditions apply)
              </li>
            ) : null}
            {verifiedPatent(CLAIMS) ? (
              <li>
                <PatentSlot tone="dark" compact />
              </li>
            ) : null}
            <li className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-brand-on-dark" aria-hidden />
              {publicCredential(registrationNo)
                ? `${doctorName} · Reg. No. ${registrationNo}`
                : `Video call with ${doctorName}`}
            </li>
          </ul>
        </div>

        <div
          className={cn(
            'w-full max-w-[440px] justify-self-start delay-700 lg:max-w-none lg:justify-self-end',
            ENTER,
          )}
        >
          <div id="start-form" className="scroll-mt-20">
            <HeroStartForm className="w-full" />
          </div>
        </div>
      </div>

      {note ? (
        <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] text-on-dark backdrop-blur sm:bottom-5 sm:left-5">
          {note}
        </span>
      ) : null}

      <a
        href="#scan"
        className="absolute bottom-8 left-1/2 hidden size-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/15 text-on-dark-muted transition-colors hover:text-on-dark lg:flex"
        aria-label="Scroll to the next section"
      >
        <ArrowDown className="size-4" />
      </a>
    </section>
  );
}

/**
 * Art-directed hero photo: H01 (landscape, subject centre-right) from 640 px up, H02 (portrait, subject
 * in the top half) on phones — or H01 for both until H02 is ready. One <img>, so only one file loads.
 */
function HeroPhoto() {
  const wide = SLOTS.H01;
  const tall = SLOTS.H02.ready ? SLOTS.H02 : SLOTS.H01;
  const common = {
    alt: 'Someone holds a phone just above their hair to check their scalp, in a dark bathroom',
    fill: true,
    priority: true,
    sizes: '100vw',
  } as const;
  const {
    props: { srcSet: wideSet },
  } = getImageProps({ ...common, src: wide.src });
  const {
    props: { srcSet: tallSet, ...img },
  } = getImageProps({ ...common, src: tall.src });

  return (
    <picture className="absolute inset-0 -z-20">
      <source media="(min-width: 640px)" srcSet={wideSet} />
      <source srcSet={tallSet} />
      {/* Art-directed via getImageProps (next/image): same optimised srcsets, one download. */}
      <img
        {...img}
        alt={common.alt}
        className="object-cover object-[50%_20%] sm:object-[65%_50%]"
      />
    </picture>
  );
}
