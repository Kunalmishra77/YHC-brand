import { ArrowRight, Check, Video } from 'lucide-react';
import Link from 'next/link';
import { getConsultTerms } from '@/components/site/consult-fee';
import { Reveal } from '@/components/site/reveal';
import { CTA_GHOST_DARK, CTA_SILVER } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { doctorClaimLabel } from '@/lib/claims';
import { publicCredential } from '@/lib/credentials';
import { DOCTOR_PORTRAIT } from '@/lib/images';
import { getDoctor } from '@/server/catalog';
import { PortraitParallax } from './doctor-feature/portrait-parallax';
import { TreatmentIndex, type TreatmentArea } from './doctor-feature/treatment-index';

/**
 * Homepage section 5 · Dr. Anil Tyagi and his treatment approach — credibility and trust.
 * Full-bleed editorial split on obsidian: the portrait fills one half edge to edge (slow parallax,
 * pearl "in your consultation" card resting on it), the other half carries the name at display scale,
 * the approach in one line and an accordion of what he assesses and treats. Only confirmed credentials
 * are shown (publicCredential); nothing is guessed.
 */

const TREATMENTS: TreatmentArea[] = [
  {
    title: 'Pattern hair loss',
    body: 'Gradual thinning at the hairline, parting or crown, in men and in women. He looks at the pattern, your family history and your scan before deciding whether a prescribed plan can help.',
  },
  {
    title: 'Telogen effluvium',
    body: 'Sudden, diffuse shedding that can follow an illness, fever, childbirth, a crash diet, stress or some medicines. He looks for the trigger first — treatment is not always needed.',
  },
  {
    title: 'Scalp conditions',
    body: 'Flaking, itching, redness or oiliness. The scalp is assessed as carefully as the hair, because the two are linked.',
  },
  {
    title: 'Follow-up and review',
    body: 'Your check-ins and progress photos are reviewed at follow-up, and the plan is adjusted — or stopped — when that is the right call.',
  },
];

const CONSULT_COVERS = [
  'Your history and scan, read before the call',
  'What is likely going on, in plain words',
  'A plan only if treatment is right for you',
  'When and how progress will be reviewed',
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
        <div className="relative lg:min-h-[52rem]">
          <div className="relative lg:absolute lg:inset-0">
            <PortraitParallax
              image={DOCTOR_PORTRAIT}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="aspect-[4/5] bg-ink-2 sm:aspect-[5/4] lg:aspect-auto lg:h-full"
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
                <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.12em] text-brand uppercase">
                  <Video className="size-4" aria-hidden />
                  {slotMinutes} min · one to one · video
                </p>
                <h3 className="mt-3 font-display text-[1.75rem] leading-tight font-medium">
                  In your consultation
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
        <div className="flex items-center px-[var(--yhc-gutter)] pt-14 pb-16 sm:pt-16 md:pb-24 lg:px-16 lg:py-24 xl:px-24">
          <Reveal className="w-full max-w-xl">
            <p className="eyebrow text-brand-on-dark">
              {doctorClaimLabel()} · <span className="whitespace-nowrap">Dermatologist-led</span>
            </p>
            <h2
              id="doctor-feature-heading"
              className="display mt-5 text-[clamp(3rem,1.9rem+4.6vw,5.5rem)] leading-[0.95] text-balance text-on-dark"
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

            <div className="mt-10 border-l border-platinum/60 pl-5 sm:pl-6">
              <p className="font-display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] leading-snug font-medium text-balance text-on-dark">
                Assessment first. Treatment only when it can help.
              </p>
              <p className="mt-3 text-[13px] text-on-dark-muted">How every YHC plan begins</p>
            </div>

            <p className="mt-8 text-[17px] leading-relaxed text-pretty text-on-dark-muted">{doctor.bio}</p>

            <h3 className="mt-12 mb-1 text-[13px] font-semibold tracking-[0.12em] text-brand-on-dark uppercase">
              What he assesses and treats
            </h3>
            <TreatmentIndex items={TREATMENTS} />

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
                <Link href="/start">Begin my 3D scan</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
