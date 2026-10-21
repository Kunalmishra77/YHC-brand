import { ArrowRight, Check, Video } from 'lucide-react';
import Link from 'next/link';
import { getConsultTerms } from '@/components/site/consult-fee';
import { Reveal } from '@/components/site/reveal';
import { CTA_GHOST_DARK, CTA_SILVER } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { publicCredential } from '@/lib/credentials';
import { DOCTOR_PORTRAIT } from '@/lib/images';
import { getDoctor } from '@/server/catalog';
import { PortraitParallax } from './doctor-feature/portrait-parallax';
import { TreatmentChips, type TreatmentChip } from './doctor-feature/treatment-chips';

/**
 * Homepage section 5 · Dr. Anil Tyagi and his treatment approach — credibility and trust.
 * Full-bleed editorial split on obsidian: the real portrait fills one half edge to edge (slow parallax,
 * pearl consultation card resting on it); the other half has the name, one plain promise and tappable
 * pills for what he treats (docs/20: short and warm). Only confirmed credentials are shown
 * (publicCredential); the registration line is hidden when it is missing.
 */

const TREATMENTS: TreatmentChip[] = [
  {
    title: 'Thinning hair',
    body: 'Slow thinning at the hairline, parting or crown, in men and women (pattern hair loss).',
  },
  {
    title: 'Sudden shedding',
    body: 'Hair fall after illness, fever, childbirth, stress or a crash diet (telogen effluvium). He finds the cause first.',
  },
  {
    title: 'Scalp problems',
    body: 'Flakes, itching, redness or oily scalp. He checks your scalp as carefully as your hair.',
  },
  {
    title: 'Follow-up',
    body: 'He looks at your check-ins and photos, then changes or stops your plan if needed.',
  },
];

const CONSULT_COVERS = [
  'He reads your scan and history first',
  'He explains what is going on, simply',
  'A plan only if treatment will help',
  'When you will check progress together',
];

export function DoctorFeature() {
  const doctor = getDoctor();
  const { slotMinutes } = getConsultTerms();
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
        <div className="relative lg:min-h-[40rem]">
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

          {/* Consultation card: overlaps the photo's lower edge on phones, rests on it from lg */}
          <div className="relative z-10 mx-[var(--yhc-gutter)] -mt-24 sm:mx-auto sm:max-w-md lg:absolute lg:bottom-10 lg:left-10 lg:mx-0 lg:mt-0 lg:w-[20rem] xl:left-14">
            <Reveal>
              <div className="rounded-2xl bg-pearl/95 p-5 text-ink shadow-raised ring-1 ring-white/60 backdrop-blur sm:p-6">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-brand">
                  <Video className="size-4" aria-hidden />
                  {slotMinutes}-minute video call
                </p>
                <h3 className="mt-3 font-display text-[1.75rem] leading-tight font-medium">
                  Just you and him
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {CONSULT_COVERS.map((line) => (
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
        <div className="flex items-center px-[var(--yhc-gutter)] pt-12 pb-14 sm:pt-14 lg:px-16 lg:py-16 xl:px-20">
          <Reveal className="w-full max-w-xl">
            <p className="eyebrow text-brand-on-dark">Meet your doctor</p>
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

            <blockquote className="mt-7 border-l border-platinum/60 pl-5 sm:pl-6">
              <p className="font-display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] leading-snug font-medium text-balance text-on-dark">
                We check first. We treat only if it will help.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-on-dark-muted">
                He looks at your scalp and your story first, then explains it in simple words.
              </p>
            </blockquote>

            <h3 className="mt-8 mb-3 text-[15px] font-semibold text-on-dark">What he treats</h3>
            <TreatmentChips items={TREATMENTS} label="What he treats" />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
                <Link href="/start">Begin my free 3D scan</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
