import type { Testimonial } from '@/server/content/testimonials';

/** One consented testimonial: the patient's words, first name or initials, city, concern and duration. */
export function QuoteCard({ item }: { item: Testimonial }) {
  return (
    <figure className="flex h-full w-[min(20rem,calc(100vw-4rem))] flex-col justify-between rounded-[var(--radius-xl)] bg-card p-6 shadow-card ring-1 ring-line sm:w-[24rem] sm:p-7">
      <div>
        <span className="block font-display text-[3.5rem] leading-[0.6] text-platinum" aria-hidden>
          “
        </span>
        <blockquote className="mt-3 text-[17px] leading-relaxed text-pretty text-ink">
          <p>{item.quote}</p>
        </blockquote>
      </div>
      <figcaption className="mt-6 border-t border-line pt-4 text-sm">
        <span className="font-semibold text-ink">{item.firstNameOrInitials}</span>
        <span className="text-muted-foreground">, {item.city}</span>
        <span className="mt-1 block text-[13px] text-muted-foreground">
          {item.concern} ·{' '}
          {item.monthsUsed === null
            ? 'Duration not stated'
            : `${item.monthsUsed} month${item.monthsUsed === 1 ? '' : 's'} on plan`}
        </span>
      </figcaption>
    </figure>
  );
}
