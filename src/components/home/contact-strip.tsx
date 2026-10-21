import Image from 'next/image';
import { illustrativeNote } from '@/components/site/slot-note';
import { SLOTS } from '@/lib/slots';
import { ChannelList } from './contact/channel-list';
import { Reveal } from './testimonials/reveal';

/**
 * Homepage section 14 · Contact us — the H27 picture, one short line, and the direct channels (WhatsApp
 * when configured, email, the message form on /contact, hours when set) as 56 px rows. Stacks on phones.
 */
export function ContactStrip() {
  const image = SLOTS.H27;
  const note = illustrativeNote(image);
  return (
    <section className="relative bg-pearl" aria-labelledby="contact-strip-heading">
      <div className="absolute inset-x-0 top-0 h-px bg-[image:var(--yhc-silver)]" aria-hidden />
      <div className="container-yhc py-10 lg:py-14">
        <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-x-5 gap-y-6 sm:grid-cols-[9rem_minmax(0,1fr)] lg:grid-cols-[13rem_minmax(0,5fr)_minmax(0,5fr)] lg:gap-12">
          <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-mist ring-1 ring-line sm:rounded-[1.75rem]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 13rem, (min-width: 640px) 9rem, 5rem"
              className="object-cover"
            />
            {note ? (
              <span className="absolute bottom-2 left-2 hidden rounded-full bg-black/55 px-2 py-0.5 text-xs text-white backdrop-blur-sm sm:inline">
                {note}
              </span>
            ) : null}
          </div>
          <Reveal>
            <h2
              id="contact-strip-heading"
              className="display text-[clamp(2rem,1.5rem+2vw,3rem)] text-balance"
            >
              Questions? Talk to us.
            </h2>
            <p className="mt-2 max-w-[40ch] leading-relaxed text-pretty text-body">
              A real person replies. Medical questions go to your doctor.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="col-span-2 lg:col-span-1">
            <ChannelList />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
