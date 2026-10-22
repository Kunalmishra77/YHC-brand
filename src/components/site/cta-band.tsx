import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Parallax } from '@/components/site/parallax';
import { Reveal } from '@/components/site/reveal';
import { CTA_GHOST_DARK, CTA_SILVER } from '@/components/site/section';
import { illustrativeNote } from '@/components/site/slot-note';
import { Button } from '@/components/ui/button';
import type { SiteImage } from '@/lib/images';
import { IMAGES } from '@/lib/images';
import { SITE } from '@/lib/site';
import { cn } from '@/lib/utils';

interface CtaAction {
  href: string;
  label: string;
}

/**
 * Closing call to action for inner pages (docs/21): a wide rounded frame with a page-relevant photo
 * drifting slowly behind a warm obsidian fade, one serif line, one sentence and the next step.
 * Default action is booking (`bookLabel`) plus WhatsApp; pass `primary` (e.g. the free scan) to change it.
 */
export function CtaBand({
  title = 'Start with a conversation, not a product.',
  body,
  bookLabel,
  primary,
  secondary,
  whatsapp,
  image = IMAGES.heroPortrait,
  imagePosition = '70% 50%',
  align = 'left',
  id = 'cta-band-heading',
}: {
  title?: string;
  body: string;
  /** Label for the default "/book" action. */
  bookLabel?: string;
  /** Replaces the default booking action. */
  primary?: CtaAction;
  /** A quiet second action (text-style button). */
  secondary?: CtaAction;
  /** Show "Ask on WhatsApp" (default: only with the booking action). */
  whatsapp?: boolean;
  /** A slot from `SLOTS`; illustrative slots get their chip automatically. */
  image?: SiteImage & { illustrative?: boolean; ready?: boolean };
  /** CSS object-position, keeping the subject clear of the text on the left. */
  imagePosition?: string;
  /** Which side the text sits on (≥ md); pick the side away from the photo's subject. */
  align?: 'left' | 'right';
  id?: string;
}) {
  const main = primary ?? { href: '/book', label: bookLabel ?? 'Book consultation' };
  const showWhatsapp = (whatsapp ?? !primary) && SITE.whatsappAvailable;
  const note = illustrativeNote(image);
  const right = align === 'right';

  return (
    <section aria-labelledby={id} className="px-[var(--yhc-gutter)] py-10 lg:py-14">
      <div className="relative isolate mx-auto flex min-h-[30rem] max-w-[calc(var(--yhc-container)+8rem)] items-end overflow-hidden rounded-[24px] bg-obsidian text-on-dark shadow-[0_30px_80px_-40px_rgba(10,12,16,0.65)] md:min-h-[32rem] md:items-center md:rounded-[32px] lg:min-h-[36rem]">
        <Parallax className="-z-20">
          <Image
            src={image.src}
            alt=""
            fill
            sizes="(min-width: 1440px) 1400px, 100vw"
            className="object-cover"
            style={{ objectPosition: imagePosition }}
          />
        </Parallax>
        {/* contrast: a deep fade from the text side, a floor fade on phones, a warm low glow */}
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 -z-10 bg-gradient-to-t from-obsidian via-obsidian/80 via-45% to-obsidian/20 md:from-obsidian/95 md:via-obsidian/70 md:via-40% md:to-obsidian/5',
            right ? 'md:bg-gradient-to-l' : 'md:bg-gradient-to-r',
          )}
        />
        <div
          aria-hidden
          className={cn(
            'absolute inset-0 -z-10',
            right
              ? 'bg-[radial-gradient(ellipse_at_88%_95%,rgba(214,158,92,0.28),transparent_55%)]'
              : 'bg-[radial-gradient(ellipse_at_12%_95%,rgba(214,158,92,0.28),transparent_55%)]',
          )}
        />
        {note ? (
          <span
            className={cn(
              'absolute top-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-on-dark backdrop-blur',
              right ? 'left-4' : 'right-4',
            )}
          >
            {note}
          </span>
        ) : null}
        <div
          className={cn(
            'w-full px-6 pt-40 pb-8 sm:px-10 md:max-w-2xl md:py-16 lg:px-16 lg:py-20',
            right && 'md:ml-auto',
          )}
        >
          <Reveal>
            <h2
              id={id}
              className="display text-[clamp(2.25rem,1.5rem+3vw,4rem)] leading-[1.04] text-balance text-on-dark"
            >
              {title}
            </h2>
          </Reveal>
          <Reveal delayMs={120}>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-pretty text-on-dark-muted">{body}</p>
          </Reveal>
          <Reveal delayMs={220}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Button asChild className={CTA_SILVER}>
                <Link href={main.href}>{main.label}</Link>
              </Button>
              {secondary ? (
                <Button asChild variant="outline" className={cn(CTA_GHOST_DARK, 'bg-black/20 backdrop-blur')}>
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              ) : null}
              {showWhatsapp ? (
                <Button asChild variant="outline" className={cn(CTA_GHOST_DARK, 'bg-black/20 backdrop-blur')}>
                  <a href={SITE.whatsappUrl}>
                    <MessageCircle className="size-4" aria-hidden />
                    Ask on WhatsApp
                  </a>
                </Button>
              ) : null}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
