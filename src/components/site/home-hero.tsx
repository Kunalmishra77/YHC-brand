import { ArrowDown, BadgeCheck, ShieldCheck, Stethoscope } from 'lucide-react';
import { HeroStartForm } from '@/components/journey/hero-start-form';
import { doctorClaimLabel } from '@/lib/claims';
import { VIDEOS } from '@/lib/images';
import { cn } from '@/lib/utils';
import { BackgroundVideo } from './background-video';
import { PatentSlot } from './patent-slot';

const ENTER =
  'animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both motion-reduce:animate-none';

/**
 * Trust-first hero (ADR-27): full-bleed laboratory b-roll, the client's headline on the left and the
 * glass "start" form (journey workstream) on the right — below the headline on mobile. It sits under the
 * translucent header, which stays dark until the hero scrolls away.
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
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate -mt-16 overflow-hidden bg-obsidian text-on-dark"
    >
      <BackgroundVideo video={VIDEOS.hero} priority objectPosition="60% 50%" className="-z-20" />
      {/* Overlays for text contrast: an even veil, a left-to-right fade and a bottom fade */}
      <div className="absolute inset-0 -z-10 bg-obsidian/45" aria-hidden />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-b from-obsidian/70 via-obsidian/50 to-obsidian lg:bg-gradient-to-r lg:from-obsidian/95 lg:via-obsidian/55 lg:to-obsidian/30"
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
            Dermatologist-led · Science-first hair care
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
            We scan your roots first. Then a doctor decides whether treatment can help you — before anything
            is prescribed.
          </p>

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
                Money-back guarantee · conditions apply
              </li>
            ) : null}
            <li>
              <PatentSlot tone="dark" compact />
            </li>
            <li className="flex items-start gap-2">
              <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-brand-on-dark" aria-hidden />
              {doctorName} · Reg. No. {registrationNo}
            </li>
          </ul>
        </div>

        <div
          className={cn(
            'w-full max-w-[440px] justify-self-start delay-700 lg:max-w-none lg:justify-self-end',
            ENTER,
          )}
        >
          <HeroStartForm className="w-full" />
        </div>
      </div>

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
