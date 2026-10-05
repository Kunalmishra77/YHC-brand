import { ArrowRight, ScanFace, Stethoscope, UserRound } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { HeroStartForm } from '@/components/journey/hero-start-form';
import { JourneyStepper } from '@/components/journey/journey-stepper';
import { getJourneyForCustomer, resumeHref } from '@/server/journey/store';
import { getCurrentCustomer } from '@/server/session';

export const metadata: Metadata = {
  title: 'Start your free hair assessment',
  description: 'Basic details, a guided 3D scalp scan and a personalised assessment reviewed by a doctor.',
};

export const dynamic = 'force-dynamic';

/** /start — step 1 (basic details) for visitors who did not use the homepage hero form. */
export default async function StartPage() {
  const customer = await getCurrentCustomer();
  const journey = customer ? getJourneyForCustomer(customer.id) : null;

  return (
    <div className="bg-hero-dark relative overflow-hidden text-on-dark">
      <div
        className="pointer-events-none absolute -top-40 -right-20 size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(201,204,209,0.16),transparent_65%)]"
        aria-hidden
      />
      <div className="container-yhc relative py-8 md:py-14">
        <JourneyStepper current="details" tone="dark" className="mb-8 md:mb-12" />
        {journey ? (
          <div className="mb-8 flex flex-col gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/15 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-on-dark">You have already started your assessment.</p>
            <Link
              href={resumeHref(journey)}
              className="bg-silver inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-obsidian"
            >
              Continue where you left off
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        ) : null}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16">
          <div>
            <p className="text-[13px] font-semibold tracking-[0.14em] text-brand-on-dark uppercase">
              Doctor-led hair assessment
            </p>
            <h1 className="mt-3 font-display text-[40px] leading-[1.05] font-medium text-on-dark md:text-[56px]">
              Understand your hair roots before you choose a treatment
            </h1>
            <p className="mt-4 max-w-xl text-on-dark-muted">
              We start with science: a guided scan of your scalp, an honest assessment of whether treatment
              can help, and a video consultation with a doctor at a time that suits you.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: UserRound, t: 'Basic details', d: 'Name, mobile and address — about 30 seconds.' },
                { icon: ScanFace, t: 'Guided 3D scan', d: 'Your phone camera, four angles, a few minutes.' },
                {
                  icon: Stethoscope,
                  t: 'Doctor review',
                  d: 'A personalised assessment, then a consultation.',
                },
              ].map(({ icon: Icon, t, d }) => (
                <li key={t} className="flex gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <Icon className="size-5 text-platinum" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium text-on-dark">{t}</span>
                    <span className="block text-sm text-on-dark-muted">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <HeroStartForm className="mx-auto lg:mx-0" />
        </div>
      </div>
    </div>
  );
}
