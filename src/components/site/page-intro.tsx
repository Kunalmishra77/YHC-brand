import Image from 'next/image';
import type { SiteImage } from '@/lib/images';
import { cn } from '@/lib/utils';
import { illustrativeNote } from './slot-note';

/**
 * Opening block for inner marketing pages — editorial, one idea. With an `image` it becomes a split
 * header; `tone="dark"` puts it on the obsidian stage used by the homepage hero.
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
        <div>
          {eyebrow ? <p className={cn('eyebrow', dark && 'text-brand-on-dark')}>{eyebrow}</p> : null}
          <h1
            className={cn(
              'display max-w-3xl text-[clamp(2.5rem,1.75rem+3vw,4.25rem)] leading-[1.04] text-balance',
              dark && 'text-on-dark',
              eyebrow ? 'mt-4' : null,
            )}
          >
            {title}
          </h1>
          {lede ? (
            <div
              className={cn(
                'mt-6 max-w-[62ch] text-lg leading-relaxed text-pretty',
                dark ? 'text-on-dark-muted' : 'text-body',
              )}
            >
              {lede}
            </div>
          ) : null}
          {children ? <div className="mt-9">{children}</div> : null}
        </div>
        {image ? (
          <div
            className={cn(
              'group relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-card md:aspect-[4/5]',
              dark ? 'bg-ink-2' : 'bg-[#efeeeb]',
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            {note ? (
              <span className="absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-on-dark backdrop-blur">
                {note}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
