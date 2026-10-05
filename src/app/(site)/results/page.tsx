import type { Metadata } from 'next';
import { Camera, FileSignature, Ruler, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { PageIntro } from '@/components/site/page-intro';
import { ResultsGallery } from '@/components/site/results-gallery';
import { pageMetadata } from '@/components/site/seo';
import { Button } from '@/components/ui/button';
import { getPublishedResults } from '@/server/content/results';

export const metadata: Metadata = pageMetadata({
  title: 'Results',
  description:
    'Before-and-after photos from patients who gave written consent, with the time on plan stated. Individual results vary.',
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
    title: 'Same conditions, both photos',
    body: 'Before and after photos are taken from the same angle and distance, in similar light, with no filters or retouching.',
  },
  {
    icon: Ruler,
    title: 'Time on plan, always stated',
    body: 'Every result says how long the person had been on their plan between the two photos — no cherry-picked dates.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacy by default',
    body: 'Faces are cropped or blurred unless the consent covers identifiable use. Names and medical details are never shown.',
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

      <section className="container-yhc py-16 md:py-24" aria-label="Before and after gallery">
        <ResultsGallery results={results} placeholders={6} />
      </section>

      <section className="border-y border-line bg-card" aria-labelledby="process-heading">
        <div className="container-yhc py-20 md:py-28">
          <h2 id="process-heading" className="display max-w-2xl text-[clamp(2.1rem,1.5rem+2.2vw,3.25rem)]">
            How we collect and show results
          </h2>
          <ul className="mt-12 grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2">
            {PROCESS.map(({ icon: Icon, title, body }) => (
              <li key={title} className="bg-card p-6 md:p-8">
                <Icon className="size-5 text-brand" aria-hidden />
                <h3 className="mt-4 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 leading-relaxed text-body">{body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
            Results shown are individual experiences, not a promise of what you will see. How your hair
            responds depends on the cause, how long it has been happening and how consistently a plan is
            followed.
          </p>
        </div>
      </section>

      <section className="container-yhc py-20 md:py-24">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="display text-[clamp(1.9rem,1.5rem+1.6vw,2.75rem)]">
              Your own baseline starts with a scan
            </h2>
            <p className="mt-3 max-w-xl text-body">
              The 3D scan captures your scalp as it is today, giving the doctor a baseline to compare against
              at follow-up.
            </p>
          </div>
          <Button asChild className="h-12 px-6">
            <Link href="/start">Begin my 3D scan</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
