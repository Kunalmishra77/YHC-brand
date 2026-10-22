import { SLOTS } from '@/lib/slots';
import { ImageText } from './fx/image-text';

/**
 * Homepage band between the science and the results (ADR-35, meridian "HAND FINISHED"): the words
 * LOOK CLOSER, edge to edge, filled with the black-and-white scalp macro (slot H05) that drifts with
 * the scroll. One quiet line under it bridges into the real results.
 */
export function LookCloserBand() {
  const photo = SLOTS.H05;
  return (
    <section
      aria-label="Look closer"
      className="relative isolate overflow-hidden bg-obsidian py-10 text-on-dark lg:py-14"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_100%,rgba(217,167,102,0.14),transparent_60%)]"
      />
      <div className="px-[var(--yhc-gutter)]">
        <ImageText
          src={photo.src}
          className="text-center font-display text-[19vw] leading-[0.82] font-semibold tracking-[-0.02em] uppercase [-webkit-text-stroke:1px_rgba(242,242,240,0.18)] sm:text-[12.2vw] 2xl:text-[11rem]"
        >
          Look <br className="sm:hidden" />
          closer
        </ImageText>
        <p className="mx-auto mt-5 max-w-[40ch] text-center text-base leading-relaxed text-pretty text-on-dark-muted lg:mt-7">
          Every plan starts with a close look at your roots.
        </p>
      </div>
    </section>
  );
}
