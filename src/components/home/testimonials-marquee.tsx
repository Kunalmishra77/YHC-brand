/**
 * Homepage section 13 · Testimonials — continuous carousel of consented testimonials only.
 * CONTRACT: `<TestimonialsMarquee />` — server component (client islands allowed inside), no required props;
 * it loads its own data from @/server/catalog / content modules. Owned by one workstream.
 */
export function TestimonialsMarquee() {
  return <section data-placeholder="testimonials-marquee" />;
}
