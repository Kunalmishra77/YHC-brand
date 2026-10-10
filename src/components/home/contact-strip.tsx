import { SECTION_Y_SM } from '@/components/site/section';
import { ChannelList } from './contact/channel-list';
import { Reveal } from './testimonials/reveal';

/**
 * Homepage section 14 · Contact us — minimal editorial split: a large serif line on the left, the direct
 * channels (WhatsApp, email, message form on /contact, hours) as 64 px rows on the right. Stacks on phones.
 */
export function ContactStrip() {
  return (
    <section className="relative bg-pearl" aria-labelledby="contact-strip-heading">
      <div className="absolute inset-x-0 top-0 h-px bg-[image:var(--yhc-silver)]" aria-hidden />
      <div className={`container-yhc ${SECTION_Y_SM}`}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-20">
          <Reveal>
            <p className="eyebrow">Contact us</p>
            <h2
              id="contact-strip-heading"
              className="display mt-4 text-[clamp(2rem,1.5rem+2vw,3rem)] text-balance"
            >
              Questions before you start?
            </h2>
            <p className="mt-4 max-w-[42ch] leading-relaxed text-pretty text-body">
              A person from our team replies. Medical questions are kept for your consultation with the
              doctor.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <ChannelList />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
