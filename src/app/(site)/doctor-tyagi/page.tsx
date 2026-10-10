import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { DoctorCard } from '@/components/site/doctor-card';
import { JsonLd } from '@/components/site/json-ld';
import { H2, SECTION_Y, SectionHeader } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { Button } from '@/components/ui/button';
import { clientEnv } from '@/lib/env';
import { CLINICAL } from '@/lib/images';
import { getDoctor } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Meet Dr. Tyagi',
  description:
    'Dr. Tyagi leads every Your Hair Company consultation. Qualifications, medical registration and what a video consultation covers.',
  path: '/doctor-tyagi',
});

const COVERS = [
  {
    title: 'Your history',
    body: 'When the change started, how it has progressed, family history, health conditions, medicines and anything you have already tried.',
  },
  {
    title: 'Your scalp photos',
    body: 'The front hairline, crown and parting photos you upload before the call, reviewed alongside what Dr. Tyagi sees on video.',
  },
  {
    title: 'What is realistic',
    body: 'A plain explanation of what may be going on, what treatment can and cannot do, and how progress is reviewed over time.',
  },
  {
    title: 'A plan — only if it is right for you',
    body: 'If treatment makes sense, you receive a prescription and a plan on WhatsApp. Sometimes the right advice is a blood test, a specialist, or simply a gentler routine.',
  },
];

export default function DoctorPage() {
  const doctor = getDoctor();
  const terms = getConsultTerms();

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Physician',
          name: doctor.name,
          description: doctor.bio,
          medicalSpecialty: 'Dermatology',
          identifier: { '@type': 'PropertyValue', name: doctor.council, value: doctor.registrationNo },
          url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/doctor-tyagi`,
          memberOf: { '@type': 'Organization', name: 'Your Hair Company' },
        }}
      />

      <section className={`container-yhc ${SECTION_Y}`}>
        <DoctorCard doctor={doctor} headingLevel="h1">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild className="h-12 px-6 text-base whitespace-normal">
              <Link href="/book">{terms.bookLabel}</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 border-steel px-6 text-base whitespace-normal">
              <Link href="/how-it-works">How a consultation works</Link>
            </Button>
          </div>
        </DoctorCard>
      </section>

      <section className="border-y border-line bg-card">
        <div
          className={`container-yhc grid gap-8 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-12 ${SECTION_Y}`}
        >
          <div>
            <p className="eyebrow">Verify</p>
            <h2 className={`${H2} mt-4`}>Credentials</h2>
            <p className="mt-4 max-w-xs leading-relaxed text-pretty text-body">
              The same details appear on every prescription you receive.
            </p>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {[
              ['Qualifications', doctor.qualifications],
              ['Medical registration no.', doctor.registrationNo],
              ['Registered with', doctor.council],
              ['Consultations', `${terms.slotMinutes}-minute video call · ${terms.fee}`],
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 py-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      {/* TODO(client): full name, qualifications, registration no., council and longer bio — see docs/12 C */}

      <section className={`container-yhc ${SECTION_Y}`} aria-labelledby="covers-heading">
        <SectionHeader
          id="covers-heading"
          eyebrow={`${terms.slotMinutes} minutes, one to one`}
          title="What a consultation covers"
        />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <figure>
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-obsidian ring-1 ring-line md:aspect-[16/9] lg:aspect-[4/5]">
              <Image
                src={CLINICAL.scalpExam.src}
                alt={CLINICAL.scalpExam.alt}
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-[13px] text-muted-foreground">
              Illustrative image. Your own scalp photos are kept for your doctor, never used in marketing.
            </figcaption>
          </figure>
          <div className="grid content-start gap-x-10 gap-y-8 sm:grid-cols-2">
            {COVERS.map((c, i) => (
              <div key={c.title} className="border-t border-line pt-5">
                <span className="price text-sm text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 text-lg font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 leading-relaxed text-pretty text-body">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-yhc pb-16 md:pb-24">
        <div className="rounded-2xl border border-line bg-mist/50 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-ink">Association disclosure</h2>
          <p className="mt-2 max-w-3xl text-body">
            {doctor.name} is associated with Your Hair Company and prescribes products sold by YHC. Your
            prescription is yours whether or not you buy from us, and you are free to fill it elsewhere.
          </p>
        </div>
      </section>

      <CtaBand
        title={`Talk to ${doctor.name} one to one.`}
        bookLabel={terms.bookLabel}
        body="Choose a time that suits you. Before the call you'll share your history and scalp photos, so the conversation can focus on you."
      />
    </>
  );
}
