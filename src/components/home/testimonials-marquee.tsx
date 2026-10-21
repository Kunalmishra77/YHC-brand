import { MessageCircle, PenLine, ShieldCheck, Undo2 } from 'lucide-react';
import Link from 'next/link';
import { SECTION_Y, SECTION_Y_SM, SectionHeader } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/site';
import { getPublishedTestimonials } from '@/server/content/testimonials';
import { Marquee } from './marquee';
import { QuoteCard } from './testimonials/quote-card';
import { Reveal } from './testimonials/reveal';

const NOTE = 'Shared with written permission. First name or initials only. Results vary.';

const PROMISES = [
  { icon: ShieldCheck, text: 'We ask only after you have been on your plan.' },
  { icon: PenLine, text: 'We share only the words you approve. Never photos or health details.' },
  { icon: Undo2, text: 'Ask us to take it down at any time, and we will.' },
] as const;

/**
 * Homepage section 13 · Testimonials. Real, consented testimonials only (ADR-27): with three or more a slow
 * continuous marquee of quote cards; with one or two a static row; with none a short "why we never fake
 * reviews" band with a way to share your story — never a placeholder quote.
 */
export function TestimonialsMarquee() {
  const items = getPublishedTestimonials();

  if (items.length === 0) return <ShareYourStory />;

  return (
    <section className="overflow-hidden bg-mist/60" aria-labelledby="testimonials-heading">
      <div className={`container-yhc ${SECTION_Y}`}>
        <SectionHeader id="testimonials-heading" title="What patients say" lede={NOTE} />
        {items.length >= 3 ? (
          <Marquee label="Patient stories" durationSec={60} minItems={6} itemClassName="flex">
            {items.map((item) => (
              <QuoteCard key={item.id} item={item} />
            ))}
          </Marquee>
        ) : (
          <ul className="flex flex-wrap gap-5">
            {items.map((item) => (
              <li key={item.id} className="flex">
                <QuoteCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/** Empty state: why there are no reviews yet, and how a patient can share theirs. No quotes, no names. */
function ShareYourStory() {
  const share = (
    <>
      <MessageCircle className="size-4" aria-hidden />
      Share your story
    </>
  );
  return (
    <section className="relative isolate overflow-hidden bg-card" aria-labelledby="testimonials-heading">
      <div className="absolute inset-x-0 top-0 h-px bg-line" aria-hidden />
      <div className={`container-yhc relative ${SECTION_Y_SM}`}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center lg:gap-16">
          <Reveal className="flex gap-5 sm:gap-8">
            {/* The visual: one large serif quote mark, deliberately left without a quote. */}
            <span
              className="-mt-3 shrink-0 font-display text-[7rem] leading-[0.8] text-platinum select-none sm:text-[10rem]"
              aria-hidden
            >
              “
            </span>
            <div className="min-w-0">
              <h2
                id="testimonials-heading"
                className="display text-[clamp(1.875rem,1.4rem+1.8vw,3rem)] leading-[1.05] text-balance"
              >
                Real stories only. Never fake reviews.
              </h2>
              <p className="mt-3 max-w-[44ch] leading-relaxed text-pretty text-body">
                Patient stories will appear here only when real patients agree in writing.
              </p>
              <Button asChild variant="outline" className="mt-5 h-12 px-6 text-base">
                {SITE.whatsappAvailable ? (
                  <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    {share}
                    <span className="sr-only">on WhatsApp (opens in a new tab)</span>
                  </a>
                ) : (
                  <Link href="/contact">{share}</Link>
                )}
              </Button>
            </div>
          </Reveal>

          <ul className="divide-y divide-line rounded-[1.75rem] bg-pearl px-5 ring-1 ring-line sm:px-6">
            {PROMISES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-4 py-4">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-obsidian text-platinum"
                  aria-hidden
                >
                  <Icon className="size-4" />
                </span>
                <span className="text-[15px] leading-snug text-pretty text-ink">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
