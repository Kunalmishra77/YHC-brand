import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { SECTION_Y, SECTION_Y_SM, SectionHeader } from '@/components/site/section';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/site';
import { getPublishedTestimonials } from '@/server/content/testimonials';
import { Marquee } from './marquee';
import { QuoteCard } from './testimonials/quote-card';
import { Reveal } from './testimonials/reveal';

const NOTE = 'Shared with written consent, first name or initials only. Individual results vary.';

const STEPS = [
  {
    title: 'After your plan review',
    text: 'Once you have been on your plan for a while, we may ask how it has gone. Saying no changes nothing about your care.',
  },
  {
    title: 'Only with written consent',
    text: 'We publish only words you approve, with your first name or initials and city. Photos and medical details are never part of it.',
  },
  {
    title: 'Yours to withdraw',
    text: 'You can ask us to take your words down at any time, and we will.',
  },
] as const;

/**
 * Homepage section 13 · Testimonials. Real, consented testimonials only (ADR-27): with three or more a slow
 * continuous marquee of quote cards; with one or two a static row; with none an honest band explaining how
 * patients can share their story — never a placeholder quote.
 */
export function TestimonialsMarquee() {
  const items = getPublishedTestimonials();

  if (items.length === 0) return <ShareYourStory />;

  return (
    <section className="overflow-hidden bg-mist/60" aria-labelledby="testimonials-heading">
      <div className={`container-yhc ${SECTION_Y}`}>
        <SectionHeader
          id="testimonials-heading"
          eyebrow="In their words"
          title="What patients say about the process"
          lede={NOTE}
        />
        {items.length >= 3 ? (
          <Marquee label="Patient testimonials" durationSec={60} itemClassName="flex">
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

/** Empty state: how a patient can share their experience, with consent. No quotes, no names. */
function ShareYourStory() {
  return (
    <section className="relative overflow-hidden bg-card" aria-labelledby="testimonials-heading">
      <div className="absolute inset-x-0 top-0 h-px bg-line" aria-hidden />
      <span
        className="pointer-events-none absolute -top-10 right-[-1rem] font-display text-[16rem] leading-none text-mist select-none md:right-8 md:text-[22rem]"
        aria-hidden
      >
        ”
      </span>
      <div className={`container-yhc relative ${SECTION_Y_SM}`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <p className="eyebrow">Testimonials</p>
            <h2
              id="testimonials-heading"
              className="display mt-4 text-[clamp(1.75rem,1.4rem+1.5vw,2.5rem)] text-balance"
            >
              Your story, with your permission
            </h2>
            <p className="mt-4 max-w-[52ch] leading-relaxed text-pretty text-body">
              You will not find invented or paid reviews here. Patient stories appear on this page only after
              treatment, in their own words, and only when they have agreed in writing.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Button asChild variant="outline" className="h-12 px-6 text-base">
                <a href={SITE.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" aria-hidden />
                  Share your experience
                  <span className="sr-only">on WhatsApp (opens in a new tab)</span>
                </a>
              </Button>
              <Link
                href="/contact"
                className="inline-flex min-h-11 items-center text-sm font-medium text-ink underline decoration-steel underline-offset-[6px] hover:decoration-current"
              >
                Or write to us
              </Link>
            </div>
          </Reveal>

          <ol className="grid gap-px overflow-hidden rounded-[var(--radius-xl)] bg-line ring-1 ring-line sm:grid-cols-3 lg:self-end">
            {STEPS.map((step, i) => (
              <li key={step.title} className="bg-card">
                <Reveal delay={i * 0.08} className="h-full p-5 sm:p-6">
                  <span className="font-display text-[2rem] leading-none text-steel" aria-hidden>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-pretty text-body">{step.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-8 text-[13px] text-muted-foreground">{NOTE}</p>
      </div>
    </section>
  );
}
