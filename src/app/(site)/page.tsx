import type { Metadata } from 'next';
import { ContactStrip } from '@/components/home/contact-strip';
import { DoctorFeature } from '@/components/home/doctor-feature';
import { FilmBand } from '@/components/home/film-band';
import { GuaranteeCompact } from '@/components/home/guarantee-compact';
import { HairLossTypes } from '@/components/home/hair-loss-types';
import { HowItWorksJourney } from '@/components/home/how-it-works-journey';
import { IngredientsExplorer } from '@/components/home/ingredients-explorer';
import { LookCloserBand } from '@/components/home/look-closer-band';
import { ResultsMarquee } from '@/components/home/results-marquee';
import { ScanInvite } from '@/components/home/scan-invite';
import { ScienceStory } from '@/components/home/science-story';
import { TestimonialsMarquee } from '@/components/home/testimonials-marquee';
import { WhatToExpect } from '@/components/home/what-to-expect';
import { WhyChoose } from '@/components/home/why-choose';
import { HomeHero } from '@/components/site/home-hero';
import { JsonLd } from '@/components/site/json-ld';
import { pageMetadata } from '@/components/site/seo';
import { BRAND_LOGO } from '@/lib/brand-media';
import { clientEnv } from '@/lib/env';
import { SITE } from '@/lib/site';
import { getDoctor, getGuarantee } from '@/server/catalog';

// Guarantee visibility, fees and slots are live settings (admin can change them in the demo).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Science-first, doctor-led hair care',
    description:
      'Hair care begins with science, not products. Take a guided 3D scalp scan; a dermatologist decides if treatment can help before anything is prescribed.',
    path: '/',
  }),
  // SEO-04: under 60 characters.
  title: { absolute: 'Your Hair Company — Science-first, doctor-led hair care' },
};

/**
 * Homepage — client-approved section order (2026-10-10). Navbar (1) and footer (15) come from the
 * (site) layout. Each section is its own component in src/components/home with its own visual logic.
 */
export default function HomePage() {
  const doctor = getDoctor();
  const guarantee = getGuarantee();
  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const logoUrl = `${siteUrl}${BRAND_LOGO.dark.src}`;

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Your Hair Company',
          url: clientEnv.NEXT_PUBLIC_SITE_URL,
          email: SITE.supportEmail,
          description: 'Science-first, doctor-led hair care: scalp scan, video consultation and follow-up.',
          areaServed: 'IN',
          logo: logoUrl,
        }}
      />
      {/* SEO-06: only confirmed facts — no address or phone until the clinic details are confirmed.
          TODO(client): reviewedBy/employee Physician once registration is confirmed — docs/16 C1 */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'MedicalClinic',
          name: 'Your Hair Company',
          url: siteUrl,
          logo: logoUrl,
          image: logoUrl,
          email: SITE.supportEmail,
          medicalSpecialty: 'Dermatology',
          areaServed: 'IN',
        }}
      />

      {/* 2 · Hero — video, headline left, glass start form right */}
      <HomeHero
        doctorName={doctor.name}
        registrationNo={doctor.registrationNo}
        guaranteeOn={guarantee !== null}
      />
      {/* 3 · Take your scalp scan */}
      <ScanInvite />
      {/* 4 · Why choose Your Hair Company */}
      <WhyChoose />
      {/* 5 · Dr. Anil Tyagi and his treatments */}
      <DoctorFeature />
      {/* 6 · How it works */}
      <HowItWorksJourney />
      {/* 7 · The science */}
      <ScienceStory />
      {/* 7b · Image-in-text band (ADR-35) */}
      <LookCloserBand />
      {/* 8 · Before & after */}
      <ResultsMarquee />
      {/* 8b · Ritual film (client's Flow film V03, scroll-played) */}
      <FilmBand
        id="ritual-film-heading"
        name="ritual"
        eyebrow="If your doctor prescribes the solution"
        poster={{ src: '/media/seq/ritual/frame_0130.webp', alt: 'A dropper releases a few drops of serum onto a hair parting' }}
        beats={[
          { title: 'A few drops.', body: 'Your doctor tells you how many, and how often.' },
          { title: 'On the thin areas.', body: 'Put them where your hair is thinning, then massage in gently.' },
          { title: 'Every day.', body: 'Small, steady habits matter more than big promises. Results vary.' },
        ]}
        cta={{ href: '/start', label: 'Begin my free 3D scan' }}
      />
      {/* 9 · What can you expect */}
      <WhatToExpect />
      {/* 10 · Ingredients */}
      {/* 10a · Ingredients film (client's Flow film V04, scroll-played) */}
      <FilmBand
        id="ingredients-film-heading"
        name="ingredients"
        eyebrow="Inside the capsules"
        poster={{ src: '/media/seq/ingredients/frame_0192.webp', alt: 'The YHC capsules jar surrounded by amla, leaves, roots and resin' }}
        beats={[
          { title: 'Plants with a long history.', body: 'Amla, bhringraj, ashwagandha and more go into the YHC capsules.' },
          { title: 'Chosen with a doctor.', body: 'Your doctor decides if they belong in your plan.' },
          { title: 'Nothing hidden.', body: 'Every ingredient is on the pack, and on this page.' },
        ]}
      />
      <IngredientsExplorer />
      {/* 11 · Types of hair loss */}
      <HairLossTypes />
      {/* 12 · Money-back guarantee (compact) */}
      <GuaranteeCompact />
      {/* 13 · Testimonials */}
      <TestimonialsMarquee />
      {/* 14 · Contact us */}
      <ContactStrip />
    </>
  );
}
