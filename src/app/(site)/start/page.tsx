import { ArrowRight, PhoneCall, ScanFace, UserRound } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { HeroStartForm } from '@/components/journey/hero-start-form';
import { JourneyStepper } from '@/components/journey/journey-stepper';
import { pageMetadata } from '@/components/site/seo';
import { illustrativeNote } from '@/components/site/slot-note';
import { SLOTS } from '@/lib/slots';
import { getSessionUser } from '@/lib/rbac';
import { listScans } from '@/server/live/scans';

export const metadata: Metadata = pageMetadata({
  title: 'Start your free hair assessment',
  description:
    'Start your free hair check: a few details, a guided scalp scan with your phone and your result straight away. Our team then calls you.',
  path: '/start',
});

export const dynamic = 'force-dynamic';

/** /start — step 1 (basic details) for visitors who did not use the homepage hero form. */
export default async function StartPage() {
  const user = await getSessionUser();
  const scans = user?.role === 'customer' && user.customerId ? await listScans(user.customerId) : null;
  const resume = scans ? (scans.some((s) => s.status === 'submitted') ? '/start/result' : '/start/scan') : null;
  const welcome = SLOTS.J08;
  const welcomeNote = illustrativeNote(welcome);

  return (
    <div className="bg-hero-dark relative overflow-hidden text-on-dark">
      <div
        className="pointer-events-none absolute -top-40 -right-20 size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(201,204,209,0.16),transparent_65%)]"
        aria-hidden
      />
      <div className="container-yhc relative pt-6 pb-14 md:pt-8 md:pb-24">
        <JourneyStepper current="details" tone="dark" className="mb-10 md:mb-14" />
        {resume ? (
          <div className="mb-8 flex flex-col gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/15 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-on-dark">
              {resume === '/start/result' ? 'Your scan result is ready.' : 'You have already started your scan.'}
            </p>
            <Link
              href={resume}
              className="bg-silver inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-obsidian"
            >
              {resume === '/start/result' ? 'See my result' : 'Continue where you left off'}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        ) : null}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-16">
          <div className="min-w-0">
            <p className="eyebrow text-brand-on-dark">Free scalp scan</p>
            <h1 className="mt-4 font-display text-[clamp(2.375rem,1.7rem+2.8vw,3.75rem)] leading-[1.05] font-medium text-balance text-on-dark">
              See your hair roots before you pick a treatment
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-pretty text-on-dark-muted">
              Scan your scalp with your phone and see your result straight away. Then our hair-care team calls you
              to talk through your options.
            </p>
            <div className="group relative mt-7 aspect-[16/9] max-w-xl overflow-hidden rounded-[28px] bg-ink-2 ring-1 ring-white/10">
              <Image
                src={welcome.src}
                alt={welcome.alt}
                fill
                priority
                sizes="(min-width: 1024px) 36rem, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
              {welcomeNote ? (
                <span className="absolute top-3 left-3 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-on-dark backdrop-blur">
                  {welcomeNote}
                </span>
              ) : null}
            </div>
            <ul className="mt-7 grid grid-cols-3 gap-3 sm:grid-cols-1 sm:gap-4">
              {[
                { icon: UserRound, t: 'Your details', d: 'Name, mobile, email and age. About 30 seconds.' },
                {
                  icon: ScanFace,
                  t: 'Scalp scan',
                  d: 'Your phone camera guides you through 7 areas. A few minutes.',
                },
                {
                  icon: PhoneCall,
                  t: 'Result and call',
                  d: 'Your result straight away, then a call from our team.',
                },
              ].map(({ icon: Icon, t, d }) => (
                <li key={t} className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                    <Icon className="size-5 text-platinum" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-on-dark sm:text-base">{t}</span>
                    <span className="hidden text-sm text-on-dark-muted sm:block">{d}</span>
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
