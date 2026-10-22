import Image from 'next/image';
import type { SiteImage } from '@/lib/images';
import { cn } from '@/lib/utils';
import styles from './motion.module.css';
import { Parallax } from './parallax';
import { riseDelay } from './section';
import { illustrativeNote } from './slot-note';

/**
 * Opening block for inner marketing pages — editorial, one idea.
 * - Wide image (landscape page-top art, composed with the subject on the right and calm space on the
 *   left): a full-bleed cinematic banner; the text sits over the calm left side behind a soft fade, so the
 *   subject is never cropped away. Phones: the picture on top, the text below.
 * - Portrait / square image (pack renders, square art): a split header with a frame matching its shape.
 * `tone="dark"` uses the obsidian stage.
 * Motion (docs/21): the banner settles with a slow ken-burns zoom and drifts as the page scrolls away;
 * eyebrow, title, lede and actions rise in a short stagger. Reduced motion: all static.
 */
export function PageIntro({
  eyebrow,
  title,
  lede,
  children,
  image,
  imageNote,
  tone = 'light',
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  /** A slot from `SLOTS` (or any SiteImage). Illustrative slots get their chip automatically. */
  image?: SiteImage & { illustrative?: boolean; ready?: boolean };
  /** Small chip on the image, e.g. "Illustrative image" for editorial stock. */
  imageNote?: string;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const dark = tone === 'dark';
  const note = imageNote ?? (image ? illustrativeNote(image) : undefined);
  const ratio = image ? image.width / image.height : 0;
  const wide = ratio >= 1.3;

  const text = (
    <>
      {eyebrow ? (
        <p style={riseDelay(0)} className={cn(styles.rise, 'eyebrow', dark && 'text-brand-on-dark')}>
          {eyebrow}
        </p>
      ) : null}
      <h1
        style={riseDelay(90)}
        className={cn(
          styles.rise,
          'display max-w-3xl text-[clamp(2.5rem,1.75rem+3vw,4.25rem)] leading-[1.04] text-balance',
          dark && 'text-on-dark',
          eyebrow ? 'mt-4' : null,
        )}
      >
        {title}
      </h1>
      {lede ? (
        <div
          style={riseDelay(200)}
          className={cn(
            styles.rise,
            'mt-6 max-w-[56ch] text-lg leading-relaxed text-pretty',
            dark ? 'text-on-dark-muted' : 'text-body',
          )}
        >
          {lede}
        </div>
      ) : null}
      {children ? (
        <div style={riseDelay(300)} className={cn(styles.rise, 'mt-9')}>
          {children}
        </div>
      ) : null}
    </>
  );

  const chip = note ? (
    <span className="absolute right-4 bottom-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-on-dark backdrop-blur">
      {note}
    </span>
  ) : null;

  if (image && wide) {
    return (
      <section
        className={cn(
          'relative isolate overflow-hidden border-b',
          dark ? 'border-line-dark bg-obsidian text-on-dark' : 'border-line bg-pearl',
          className,
        )}
      >
        <div className="relative aspect-[16/10] sm:aspect-[16/8] md:absolute md:inset-0 md:-z-10 md:aspect-auto">
          <Parallax mode="exit" strength={10}>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="100vw"
              className={cn(styles.kenburns, 'object-cover object-[75%_50%] md:object-[100%_35%]')}
            />
          </Parallax>
          {/* desktop: calm fade on the left for the text */}
          <div
            aria-hidden
            className={cn(
              'absolute inset-0 hidden bg-gradient-to-r md:block',
              dark
                ? 'from-obsidian via-obsidian/85 via-35% to-obsidian/0 to-75%'
                : 'from-pearl via-pearl/85 via-35% to-pearl/0 to-75%',
            )}
          />
          {/* phones: fade the picture into the page below */}
          <div
            aria-hidden
            className={cn(
              'absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t md:hidden',
              dark ? 'from-obsidian to-transparent' : 'from-pearl to-transparent',
            )}
          />
          {chip}
        </div>
        <div className="container-yhc relative pt-6 pb-12 md:flex md:min-h-[30rem] md:items-center md:py-20 lg:min-h-[34rem]">
          <div className="max-w-xl lg:max-w-2xl">{text}</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'border-b',
        dark ? 'border-line-dark bg-obsidian text-on-dark' : 'border-line',
        className,
      )}
    >
      <div
        className={cn(
          'container-yhc grid gap-10 pt-14 pb-12 md:py-20 lg:py-24',
          image && 'md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center md:gap-12 lg:gap-16',
        )}
      >
        <div>{text}</div>
        {image ? (
          <div
            className={cn(
              'group relative overflow-hidden rounded-[28px] shadow-card',
              ratio < 0.9 ? 'aspect-[4/5]' : 'aspect-square',
              'mx-auto w-full max-w-md md:max-w-none',
              dark ? 'bg-ink-2' : 'bg-[#efeeeb]',
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className={cn(
                styles.kenburns,
                'object-cover transition-[scale] duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100',
              )}
            />
            {chip}
          </div>
        ) : null}
      </div>
    </section>
  );
}
