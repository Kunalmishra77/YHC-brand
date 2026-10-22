import { illustrativeNote } from '@/components/site/slot-note';
import { SLOTS } from '@/lib/slots';
import { ChannelList } from './contact/channel-list';
import { ParallaxImage } from './fx/parallax-image';
import { Reveal } from './testimonials/reveal';

/**
 * Homepage section 14 · Contact us — the H27 picture, large and drifting gently with the scroll
 * (ADR-35), one short line, and the direct channels (WhatsApp when configured, email, the message form
 * on /contact, hours when set) as 56 px rows. Stacks on phones.
 */
export function ContactStrip() {
  const image = SLOTS.H27;
  const note = illustrativeNote(image);
  return (
    <section className="relative bg-pearl" aria-labelledby="contact-strip-heading">
      <div className="absolute inset-x-0 top-0 h-px bg-[image:var(--yhc-silver)]" aria-hidden />
      <div className="container-yhc py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16">
          <Reveal>
            <ParallaxImage
              src={image.src}
              alt={image.alt}
              sizes="(min-width: 1024px) 40vw, 100vw"
              amount={9}
              className="aspect-[16/10] rounded-[28px] bg-mist ring-1 ring-line lg:aspect-[5/4]"
            >
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-obsidian/30 to-transparent"
              />
              {note ? (
                <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                  {note}
                </span>
              ) : null}
            </ParallaxImage>
          </Reveal>
          <div>
            <Reveal>
              <h2
                id="contact-strip-heading"
                className="display text-[clamp(2.25rem,1.6rem+2.6vw,3.75rem)] leading-[1] text-balance"
              >
                Questions? Talk to us.
              </h2>
              <p className="mt-3 max-w-[40ch] leading-relaxed text-pretty text-body">
                A real person replies. Medical questions go to your doctor.
              </p>
            </Reveal>
            <Reveal delay={0.08} className="mt-6">
              <ChannelList />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
