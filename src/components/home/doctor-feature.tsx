import { ArrowRight, Check, Stethoscope } from 'lucide-react';
import Link from 'next/link';
import { Reveal } from '@/components/site/reveal';
import { CTA_GHOST_DARK, CTA_SILVER } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { publicCredential } from '@/lib/credentials';
import { DOCTOR_PORTRAIT } from '@/lib/images';
import { getDoctor } from '@/server/catalog';
import { PortraitParallax } from './doctor-feature/portrait-parallax';
import { Marquee } from './marquee';
import { TreatmentChips, type TreatmentChip } from './doctor-feature/treatment-chips';

/**
 * Homepage section 5 · Dr. Anil Tyagi, the founding dermatologist behind YHC's products and approach.
 * (2026-11-05: he does not review scans or take calls for now, so nothing here promises that.)
 * Full-bleed editorial split on obsidian: the real portrait fills one half edge to edge (slow parallax,
 * pearl "about" card resting on it); the other half has the name, one plain promise and tappable
 * pills for what the approach covers (docs/20: short and warm). Only confirmed credentials are shown
 * (publicCredential); the registration line is hidden when it is missing. Cinematic pass (ADR-35): a
 * deeper portrait parallax and a slow ribbon of what the approach covers under the split.
 */

const TREATMENTS: TreatmentChip[] = [
  {
    title: 'Thinning hair',
    body: 'Slow thinning at the hairline, parting or crown, in men and women (pattern hair loss).',
  },
  {
    title: 'Sudden shedding',
    body: 'Hair fall after illness, fever, childbirth, stress or a crash diet (telogen effluvium). Our approach looks for the cause first.',
  },
  {
    title: 'Scalp problems',
    body: 'Flakes, itching, redness or oily scalp. We look at your scalp as carefully as your hair.',
  },
  {
    title: 'Staying on track',
    body: 'If you start a plan, our team checks in with you so you can keep going, or stop, when needed.',
  },
];

const ABOUT_LINES = [
  'Developed our scalp-first approach',
  'Helped shape our hair-care products',
  'Check the roots before suggesting anything',
  'Plain words, no false promises',
];

export function DoctorFeature() {
  const doctor = getDoctor();
  const role = publicCredential(doctor.qualifications) ?? 'Dermatologist';
  const registration = publicCredential(doctor.registrationNo);
  const council = registration ? publicCredential(doctor.council) : null;

  return (
    <section
      aria-labelledby="doctor-feature-heading"
      className="relative isolate overflow-hidden bg-obsidian text-on-dark"
    >
      <div className="grid lg:grid-cols-2">
        {/* Portrait — edge to edge on every screen */}
        <div className="relative lg:min-h-[36rem]">
          <div className="relative lg:absolute lg:inset-0">
            <PortraitParallax
              image={DOCTOR_PORTRAIT}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-square bg-ink-2 sm:aspect-[5/4] lg:aspect-auto lg:h-full"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/10 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-obsidian/40"
              aria-hidden
            />
          </div>

          {/* About card: overlaps the photo's lower edge on phones, rests on it from lg */}
          <div className="relative z-10 mx-[var(--yhc-gutter)] -mt-24 sm:mx-auto sm:max-w-md lg:absolute lg:bottom-10 lg:left-10 lg:mx-0 lg:mt-0 lg:w-[20rem] xl:left-14">
            <Reveal>
              <div className="rounded-2xl bg-pearl/95 p-5 text-ink shadow-raised ring-1 ring-white/60 backdrop-blur sm:p-6">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-brand">
                  <Stethoscope className="size-4" aria-hidden />
                  Founding dermatologist
                </p>
                <h3 className="mt-3 font-display text-[1.75rem] leading-tight font-medium">
                  The method behind YHC
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {ABOUT_LINES.map((line) => (
                    <li key={line} className="flex gap-2.5 text-[15px] leading-snug text-body">
                      <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Text block */}
        <div className="flex items-center px-[var(--yhc-gutter)] pt-10 pb-10 sm:pt-12 lg:px-14 lg:py-12 xl:px-20">
          <Reveal className="w-full max-w-xl">
            <p className="eyebrow text-brand-on-dark">The doctor behind YHC</p>
            <h2
              id="doctor-feature-heading"
              className="display mt-4 text-[clamp(2.75rem,1.8rem+3.8vw,4.75rem)] leading-[0.95] text-balance text-on-dark"
            >
              {doctor.name}
            </h2>
            <p className="mt-4 text-lg text-on-dark-muted">{role} · hair and scalp</p>
            {registration ? (
              <p className="mt-1.5 text-sm text-on-dark-muted">
                Reg. No. <span className="price text-on-dark">{registration}</span>
                {council ? ` · ${council}` : null}
              </p>
            ) : null}

            <blockquote className="mt-6 border-l border-platinum/60 pl-5 sm:pl-6">
              <p className="font-display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] leading-snug font-medium text-balance text-on-dark">
                We check first. We treat only if it will help.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-on-dark-muted">
                That is why every YHC journey starts with a free scan of your scalp.
              </p>
            </blockquote>

            <h3 className="mt-7 mb-3 text-[15px] font-semibold text-on-dark">What our approach covers</h3>
            <TreatmentChips items={TREATMENTS} label="What our approach covers" />

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild className={`group w-full rounded-full sm:w-auto ${CTA_SILVER}`}>
                <Link href="/doctor-tyagi">
                  Meet {doctor.name}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </Button>
              <Button asChild variant="outline" className={`w-full rounded-full sm:w-auto ${CTA_GHOST_DARK}`}>
                <Link href="/start">Begin my free scalp scan</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>

      {/* What our approach covers, as a slow ribbon of big serif words under the split (pause control included). */}
      <div className="relative border-t border-line-dark pt-6 pb-5 lg:pt-8">
        <Marquee label="What our approach covers" tone="dark" durationSec={36} minItems={8} className="text-center">
          {TREATMENTS.map((item) => (
            <span
              key={item.title}
              className="flex items-center gap-5 pr-1 font-display text-[clamp(2rem,1.4rem+2.6vw,3.75rem)] leading-none font-medium whitespace-nowrap text-white/10 transition-colors duration-500 [-webkit-text-stroke:1px_rgba(242,242,240,0.6)] hover:text-on-dark"
            >
              {item.title}
              <span aria-hidden className="size-2.5 rounded-full bg-[image:var(--yhc-silver)]" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
