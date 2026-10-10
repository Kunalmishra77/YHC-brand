import 'server-only';

/**
 * Patient testimonials (ADR-27, PRD §15). Only real words from real patients who agreed in writing to
 * publication are ever added here, never invented, paraphrased into praise, paid for or AI-written.
 * Patients appear by first name or initials and city only; quotes are not edited beyond trimming for
 * length with the patient's approval.
 * TODO(client): supply consented testimonials (quote, first name or initials, city, concern, months on plan,
 * date the written consent was recorded) — see docs/12 C (content).
 */
export interface TestimonialConsent {
  /** Patient agreed in writing to publication on the website. Only `true` entries are shown. */
  publication: boolean;
  /** ISO date the written consent was recorded (internal reference; never displayed). */
  recordedOn: string;
}

export interface Testimonial {
  id: string;
  /** The patient's own words. No efficacy promises added by us. */
  quote: string;
  /** First name or initials only, e.g. "Rohan" or "S.K.". */
  firstNameOrInitials: string;
  city: string;
  /** Plain-language concern, e.g. "Crown thinning". No diagnosis wording. */
  concern: string;
  /** Months on the plan when the testimonial was given; null when not stated. */
  monthsUsed: number | null;
  consent: TestimonialConsent;
}

export const TESTIMONIALS: Testimonial[] = [];

/** Testimonials safe to publish: written publication consent recorded, with a date, and a non-empty quote. */
export function getPublishedTestimonials(list: Testimonial[] = TESTIMONIALS): Testimonial[] {
  return list.filter(
    (item) =>
      item.consent.publication === true &&
      item.consent.recordedOn.trim() !== '' &&
      item.quote.trim() !== '' &&
      item.firstNameOrInitials.trim() !== '',
  );
}
