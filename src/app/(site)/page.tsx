import type { Metadata } from 'next';
import { ContactStrip } from '@/components/home/contact-strip';
import { DoctorFeature } from '@/components/home/doctor-feature';
import { GuaranteeCompact } from '@/components/home/guarantee-compact';
import { HairLossTypes } from '@/components/home/hair-loss-types';
import { HowItWorksJourney } from '@/components/home/how-it-works-journey';
import { IngredientsExplorer } from '@/components/home/ingredients-explorer';
import { ResultsMarquee } from '@/components/home/results-marquee';
import { ScanInvite } from '@/components/home/scan-invite';
import { ScienceStory } from '@/components/home/science-story';
import { TestimonialsMarquee } from '@/components/home/testimonials-marquee';
import { WhatToExpect } from '@/components/home/what-to-expect';
import { WhyChoose } from '@/components/home/why-choose';
import { HomeHero } from '@/components/site/home-hero';
import { JsonLd } from '@/components/site/json-ld';
import { pageMetadata } from '@/components/site/seo';
import { clientEnv } from '@/lib/env';
import { SITE } from '@/lib/site';
import { getDoctor, getGuarantee } from '@/server/catalog';

// Guarantee visibility, fees and slots are live settings (admin can change them in the demo).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Science-first, doctor-led hair care',
    description:
      'Hair care begins with science, not with products. Start with a guided 3D scalp scan; a dermatologist decides whether treatment can help before anything is prescribed.',
    path: '/',
  }),
  title: { absolute: 'Your Hair Company — Hair care begins with science, not with products' },
};

/**
 * Homepage — client-approved section order (2026-10-10). Navbar (1) and footer (15) come from the
 * (site) layout. Each section is its own component in src/components/home with its own visual logic.
 */
export default function HomePage() {
  const doctor = getDoctor();
  const guarantee = getGuarantee();

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
      {/* 8 · Before & after */}
      <ResultsMarquee />
      {/* 9 · What can you expect */}
      <WhatToExpect />
      {/* 10 · Ingredients */}
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
