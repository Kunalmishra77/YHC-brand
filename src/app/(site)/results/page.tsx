import type { Metadata } from 'next';
import { Camera, FileSignature, Ruler, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { PageIntro } from '@/components/site/page-intro';
import { ResultsGallery } from '@/components/site/results-gallery';
import { H2_SM, SECTION_Y, SectionHeader } from '@/components/site/section';
import { pageMetadata } from '@/components/site/seo';
import { Button } from '@/components/ui/button';
import { getPublishedResults } from '@/server/content/results';

export const metadata: Metadata = pageMetadata({
  title: 'Results',
  description:
    'Before-and-after photos from real patients who gave written consent, after a plan prescribed by the doctor. Faces hidden for privacy. Individual results vary.',
  path: '/results',
});

const PROCESS = [
  {
    icon: FileSignature,
    title: 'Written consent first',
    body: 'A photo is shown only if the patient has signed a consent form for that specific use. Consent can be withdrawn at any time, and the photo is removed.',
  },
  {
    icon: Camera,
    title: 'Same area, both photos',
    body: 'Before and after photos show the same area of the scalp, with no filters or retouching. We only crop them, to keep faces out of view.',
  },
  {
    icon: Ruler,
    title: 'Time between photos, stated',
    body: 'Every result states the time between the two photos once the clinic has confirmed it from the patient record. Until then it reads “to be confirmed” — never a guessed date.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy by default',
    body: 'Photos are cropped to the scalp so faces are not shown. Patients appear as “Patient A”, “Patient B” — names and medical details are never shown.',
  },
];

export default function ResultsPage() {
  const results = getPublishedResults();
  return (
    <>
      <PageIntro
        eyebrow="Results"
        title="Real results, shared with consent"
        lede="Hair changes slowly and differently for everyone. These are real patients who agreed in writing to share their photos — never stock images, models or AI. Individual results vary."
      />

      <section className={`container-yhc ${SECTION_Y}`} aria-label="Before and after gallery">
        <ResultsGallery results={results} layout="grid" placeholders={6} />
      </section>

      <section className="border-y border-line bg-card" aria-labelledby="process-heading">
        <div className={`container-yhc ${SECTION_Y}`}>
          <SectionHeader
            id="process-heading"
            eyebrow="Our standard"
            title="How we collect and show results"
          />
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
            Results shown are individual experiences, not a promise of what you will see. How your hair
            responds depends on the cause, how long it has been happening and how consistently a plan is
            followed.
          </p>
        </div>
      </section>

      <section className="container-yhc py-16 md:py-20">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between md:gap-12">
          <div className="max-w-xl">
            <h2 className={H2_SM}>Your own baseline starts with a scan</h2>
            <p className="mt-3 leading-relaxed text-pretty text-body">
              The 3D scan captures your scalp as it is today, giving the doctor a baseline to compare against
              at follow-up.
            </p>
          </div>
          <Button asChild className="h-12 shrink-0 px-7 text-base">
            <Link href="/start">Begin my 3D scan</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
