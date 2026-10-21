import type { Metadata } from 'next';
import { Camera, FileSignature, Ruler, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { PageIntro } from '@/components/site/page-intro';
import { SLOTS } from '@/lib/slots';
import { ResultsGallery } from '@/components/site/results-gallery';
import { H2_SM, SECTION_Y, SectionHeader } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { Button } from '@/components/ui/button';
import { getPublishedResults } from '@/server/content/results';

export const metadata: Metadata = pageMetadata({
  title: 'Results',
  description:
    'Before-and-after photos from real patients who agreed in writing, after a plan from the doctor. Faces hidden for privacy. Individual results vary.',
  path: '/results',
  ownImage: true,
});

const PROCESS = [
  {
    icon: FileSignature,
    title: 'Written consent first',
    body: 'We show a photo only if the patient signed a form saying yes to this use. They can say no later, and we take it down.',
  },
  {
    icon: Camera,
    title: 'Same area, both photos',
    body: 'Both photos show the same part of the scalp. No filters, no editing. We only crop them to hide faces.',
  },
  {
    icon: Ruler,
    title: 'Time between photos, stated',
    body: 'We show the time between the photos only after the clinic checks it in the patient record. Never a guess.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    body: 'Photos show only the scalp, never faces. Patients are “Patient A”, “Patient B”. We never show names or health details.',
  },
];

export default function ResultsPage() {
  const results = getPublishedResults();
  return (
    <>
      <PageIntro
        eyebrow="Results"
        title="Real results, shared with consent"
        image={SLOTS.S03}
        lede="Hair changes slowly, and differently for everyone. These are real patients who agreed in writing to share their photos. Never stock images, models or AI. Individual results vary."
      />

      <section className={`container-yhc ${SECTION_Y}`} aria-label="Before and after gallery">
        <ResultsGallery results={results} layout="grid" placeholders={6} />
      </section>

      <section className="border-y border-line bg-card" aria-labelledby="process-heading">
        <div className={`container-yhc ${SECTION_Y}`}>
          <SectionHeader id="process-heading" eyebrow="Our rules" title="How we collect and show results" />
          <ul className="grid gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-2">
            {PROCESS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="bg-card p-6 md:p-8">
                <span className="flex size-10 items-center justify-center rounded-full bg-mist text-brand">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 max-w-[52ch] leading-relaxed text-pretty text-body">{body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
            These are one person’s results, not a promise of yours. How your hair responds depends on the
            cause, how long it has been going on, and how closely you follow your plan.
          </p>
        </div>
      </section>

      <section className="container-yhc py-16 md:py-20">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between md:gap-12">
          <div className="max-w-xl">
            <h2 className={H2_SM}>Your own “before” starts with a scan</h2>
            <p className="mt-3 leading-relaxed text-pretty text-body">
              The 3D scan records your scalp as it is today. At follow-up, the doctor compares against it.
            </p>
          </div>
          <Button asChild className="h-12 shrink-0 px-7 text-base">
            <Link href="/start">Begin my free 3D scan</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
