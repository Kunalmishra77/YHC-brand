import { BadgeCheck, ShieldCheck, Stethoscope } from 'lucide-react';
import { illustrativeNote } from '@/components/site/slot-note';
import { CLAIMS, doctorClaimLabel, verifiedPatent } from '@/lib/claims';
import { publicCredential } from '@/lib/credentials';
import { SLOTS } from '@/lib/slots';
import { HeroCinema } from './hero/hero-cinema';
import { HeroStacked } from './hero/hero-stacked';
import { PatentSlot } from './patent-slot';

/**
 * Homepage hero — a cinematic scroll story (docs/21, ADR-35). Large screens with motion allowed get the
 * pinned film (HeroCinema); phones, tablets and reduced motion get the stacked, swipeable version
 * (HeroStacked). Both render on the server and CSS shows exactly one, so there is one h1 and one form in
 * the accessibility tree at a time. `id="home-hero"` lets the header stay dark until the hero is passed.
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
  const trust = (
    <ul className="flex flex-wrap gap-2" aria-label="Why people trust us">
      <TrustChip icon={<Stethoscope className="size-4" aria-hidden />}>{doctorClaimLabel()}</TrustChip>
      <TrustChip icon={<BadgeCheck className="size-4" aria-hidden />}>
        {publicCredential(registrationNo)
          ? `${doctorName} · Reg. No. ${registrationNo}`
          : `Video call with ${doctorName}`}
      </TrustChip>
      {guaranteeOn ? (
        <TrustChip icon={<ShieldCheck className="size-4" aria-hidden />}>
          Money-back guarantee (conditions apply)
        </TrustChip>
      ) : null}
      {verifiedPatent(CLAIMS) ? (
        <li className="inline-flex min-h-9 items-center rounded-full bg-white/[0.07] px-3.5 text-[13px] ring-1 ring-white/15 backdrop-blur">
          <PatentSlot compact tone="dark" />
        </li>
      ) : null}
    </ul>
  );

  return (
    <section
      id="home-hero"
      aria-labelledby="hero-heading"
      className="relative -mt-16 bg-obsidian text-on-dark"
    >
      <div className="hidden lg:motion-safe:block">
        <HeroCinema trust={trust} note={illustrativeNote(SLOTS.H01)} />
      </div>
      <div className="lg:motion-safe:hidden">
        <HeroStacked trust={trust} />
      </div>
    </section>
  );
}

function TrustChip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-1.5 text-[13px] leading-snug text-on-dark ring-1 ring-white/15 backdrop-blur [&_svg]:text-brand-on-dark">
      {icon}
      {children}
    </li>
  );
}
