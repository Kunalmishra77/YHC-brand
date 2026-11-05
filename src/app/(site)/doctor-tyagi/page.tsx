import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getConsultTerms } from '@/components/site/consult-fee';
import { CtaBand } from '@/components/site/cta-band';
import { DoctorCard } from '@/components/site/doctor-card';
import { JsonLd } from '@/components/site/json-ld';
import { Parallax } from '@/components/site/parallax';
import { Reveal } from '@/components/site/reveal';
import { H2, SECTION_Y, SectionHeader } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { publicCredential } from '@/lib/credentials';
import { Button } from '@/components/ui/button';
import { clientEnv } from '@/lib/env';
import { CLINICAL } from '@/lib/images';
import { SLOTS } from '@/lib/slots';
import { getDoctor } from '@/server/catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = pageMetadata({
  title: 'Meet Dr. Tyagi',
  description:
    'Meet Dr. Tyagi, the founding dermatologist behind Your Hair Company: his qualifications, his medical registration and his scalp-first approach.',
  path: '/doctor-tyagi',
});

// 2026-11-05: Dr. Tyagi is not reviewing scans or holding consultations for now, so this page is about
// the doctor behind YHC and his approach — it promises no call, review or prescription.
const COVERS = [
  {
    title: 'Roots first',
    body: 'Hair grows from living roots. Checking the scalp comes before any product. That is why YHC starts with a scalp scan.',
  },
  {
    title: 'Plain words',
    body: 'What may be going on, and what hair care can and cannot do, said simply. No jargon, no hype.',
  },
  {
    title: 'What is realistic',
    body: 'Change is slow and different for everyone. No false promises and no fixed timelines.',
  },
  {
    title: 'Products with a purpose',
    body: 'Every ingredient in the YHC range has a job, and every ingredient is listed on the pack.',
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
          ...(publicCredential(doctor.registrationNo)
            ? { identifier: { '@type': 'PropertyValue', name: doctor.council, value: doctor.registrationNo } }
            : {}),
          url: `${clientEnv.NEXT_PUBLIC_SITE_URL}/doctor-tyagi`,
          memberOf: { '@type': 'Organization', name: 'Your Hair Company' },
        }}
      />

      <section className={`container-yhc ${SECTION_Y}`}>
        <DoctorCard doctor={doctor} headingLevel="h1">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild className="h-12 px-6 text-base whitespace-normal">
              <Link href={terms.bookHref}>{terms.bookLabel}</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 border-steel px-6 text-base whitespace-normal">
              <Link href="/how-it-works">How it works</Link>
            </Button>
          </div>
        </DoctorCard>
      </section>

      <section className="border-y border-line bg-card">
        <div
          className={`container-yhc grid gap-8 md:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] md:gap-12 ${SECTION_Y}`}
        >
          <div>
            <p className="eyebrow">Check for yourself</p>
            <h2 className={`${H2} mt-4`}>Credentials</h2>
            <p className="mt-4 max-w-xs leading-relaxed text-pretty text-body">
              Check his details for yourself.
            </p>
          </div>
          <dl className="divide-y divide-line border-y border-line">
            {(
              [
                ['Qualifications', publicCredential(doctor.qualifications)],
                ['Medical registration no.', publicCredential(doctor.registrationNo)],
                // The council is only meaningful next to a registration number.
                [
                  'Registered with',
                  publicCredential(doctor.registrationNo) ? publicCredential(doctor.council) : null,
                ],
              ] satisfies [string, string | null][]
            )
              .filter((row): row is [string, string] => row[1] !== null)
              .map(([label, value]) => (
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
          eyebrow="His approach"
          title="How he thinks about hair"
        />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <figure>
            <div className="relative aspect-[3/2] overflow-hidden rounded-[28px] bg-obsidian ring-1 ring-line md:aspect-[16/9] lg:aspect-[4/3]">
              <Parallax>
                <Image
                  src={CLINICAL.scalpExam.src}
                  alt={CLINICAL.scalpExam.alt}
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover"
                />
              </Parallax>
            </div>
            <figcaption className="mt-3 text-[13px] text-muted-foreground">
              Illustrative image. Your own scalp photos are private. We never use them in ads.
            </figcaption>
          </figure>
          <div className="grid content-start gap-x-10 gap-y-8 sm:grid-cols-2">
            {COVERS.map((c, i) => (
              <Reveal key={c.title} delayMs={(i % 2) * 100} className="border-t border-line pt-5">
                <span className="price text-sm text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 text-lg font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 leading-relaxed text-pretty text-body">{c.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-yhc pb-4 lg:pb-6">
        <div className="rounded-2xl border border-line bg-mist/50 p-6 md:p-8">
          <h2 className="text-lg font-semibold text-ink">Our link with the doctor</h2>
          <p className="mt-2 max-w-3xl text-body">
            {doctor.name} works with Your Hair Company and helped develop the products YHC sells. He is not
            reviewing individual scans or holding consultations at the moment. After your free scalp scan,
            our hair-care team calls you back.
          </p>
        </div>
      </section>

      <CtaBand
        id="doctor-cta-heading"
        image={SLOTS.H03}
        imagePosition="55% 50%"
        title="Start with your scalp."
        bookLabel={terms.bookLabel}
        body="Take the free scalp scan with your phone. You see your result straight away, and our hair-care team calls you back."
      />
    </>
  );
}
