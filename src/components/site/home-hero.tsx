import { ArrowDown, BadgeCheck, ScanFace, ShieldCheck, Stethoscope } from 'lucide-react';
import Image from 'next/image';
import { HeroStartForm } from '@/components/journey/hero-start-form';
import { illustrativeNote } from '@/components/site/slot-note';
import { CLAIMS, doctorClaimLabel, verifiedPatent } from '@/lib/claims';
import { publicCredential } from '@/lib/credentials';
import { SLOTS } from '@/lib/slots';
import { cn } from '@/lib/utils';
import { PatentSlot } from './patent-slot';

const ENTER =
  'animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both motion-reduce:animate-none';

/**
 * Trust-first hero (ADR-27, docs/20) — light and warm. The client-approved headline sits on a pearl stage
 * on the left; on the right a bright photo of someone scanning their scalp at home (slot H03) carries the
 * glass "start" form. Phones: headline, a primary action above the fold, then the photo with the form.
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
  const photo = SLOTS.H03;
  const note = illustrativeNote(photo);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate -mt-16 overflow-hidden bg-pearl text-ink"
    >
      {/* Soft warm light + a faint scan grid, so the stage never feels flat. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_10%,rgba(224,205,180,0.45),transparent_55%),radial-gradient(ellipse_at_0%_100%,rgba(174,187,200,0.35),transparent_50%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.35] [mask-image:radial-gradient(ellipse_at_30%_40%,black,transparent_70%)]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(18,19,21,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(18,19,21,0.06) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="container-yhc grid items-center gap-10 pt-28 pb-16 sm:pt-32 lg:min-h-[100svh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14 lg:pt-28 lg:pb-16 xl:gap-20">
        <div className="max-w-[38rem]">
          <p className={cn('inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-[13px] font-medium text-body shadow-card ring-1 ring-line backdrop-blur delay-100', ENTER)}>
            <ScanFace className="size-4 text-brand" aria-hidden />
            Doctor-led hair care · Free 3D scalp scan
          </p>
          <h1
            id="hero-heading"
            className={cn(
              'display mt-6 text-[clamp(2.6rem,1.5rem+4.4vw,5.25rem)] leading-[1.02] text-balance text-ink delay-200',
              ENTER,
            )}
          >
            Hair care begins with science, not with products.
          </h1>
          <p className={cn('mt-6 max-w-lg text-base leading-relaxed text-pretty text-body delay-300 sm:text-lg', ENTER)}>
            First we scan your scalp. Then a doctor tells you if treatment will help.
          </p>

          {/* Mobile: a primary action above the fold (audit UX-05); the form sits with the photo below. */}
          <a
            href="#start-form"
            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-obsidian text-[15px] font-semibold text-on-dark transition-opacity hover:opacity-90 sm:w-auto sm:px-8 lg:hidden"
          >
            Begin my free 3D scan
            <ArrowDown className="size-4" aria-hidden />
          </a>

          <ul
            className={cn(
              'mt-9 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-line pt-6 text-[14px] leading-snug text-body delay-500 sm:grid-cols-2',
              ENTER,
            )}
            aria-label="Why people trust us"
          >
            <li className="flex items-start gap-2.5">
              <Stethoscope className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              {doctorClaimLabel()}
            </li>
            {guaranteeOn ? (
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                Money-back guarantee (conditions apply)
              </li>
            ) : null}
            {verifiedPatent(CLAIMS) ? (
              <li>
                <PatentSlot compact />
              </li>
            ) : null}
            <li className="flex items-start gap-2.5">
              <BadgeCheck className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              {publicCredential(registrationNo)
                ? `${doctorName} · Reg. No. ${registrationNo}`
                : `Video call with ${doctorName}`}
            </li>
          </ul>
        </div>

        {/* Photo stage with the glass form */}
        {/* No entrance transform here: it would trap the absolutely positioned desktop photo in this column. */}
        <div className="relative w-full lg:static lg:flex lg:h-full lg:items-end lg:justify-end lg:self-stretch lg:pb-12">
          {/* Phones: a rounded photo card. Desktop: the right half of the hero, edge to edge. */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] shadow-raised ring-1 ring-black/5 sm:aspect-[4/3] lg:absolute lg:inset-y-0 lg:right-0 lg:-z-10 lg:aspect-auto lg:w-[48%] lg:rounded-none lg:rounded-bl-[56px] lg:shadow-none lg:ring-0">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover object-[50%_25%] lg:object-[50%_15%]"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-obsidian/5 to-transparent lg:from-obsidian/45" />
            <div aria-hidden className="absolute inset-y-0 left-0 hidden w-40 bg-gradient-to-r from-pearl to-transparent lg:block" />
            {note ? (
              <span className="absolute top-4 left-4 rounded-full bg-black/55 lg:top-24 lg:right-6 lg:left-auto px-3 py-1.5 text-xs font-medium text-on-dark backdrop-blur">
                {note}
              </span>
            ) : null}
          </div>
          <div
            id="start-form"
            className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both delay-300 duration-700 motion-reduce:animate-none relative z-10 mx-auto -mt-24 w-[calc(100%-1.5rem)] max-w-[420px] scroll-mt-24 sm:-mt-40 lg:mx-0 lg:mt-0 lg:w-[380px] xl:w-[400px]"
          >
            <HeroStartForm className="w-full max-w-none bg-obsidian/75 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.65)]" />
          </div>
        </div>
      </div>

      <a
        href="#scan"
        className="absolute bottom-6 left-1/2 hidden size-11 -translate-x-1/2 items-center justify-center rounded-full border border-line bg-white/70 text-body backdrop-blur transition-colors hover:text-ink lg:flex"
        aria-label="Scroll to the next section"
      >
        <ArrowDown className="size-4" />
      </a>
    </section>
  );
}
