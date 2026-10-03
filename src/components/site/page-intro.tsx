import Image from 'next/image';
import type { SiteImage } from '@/lib/images';
import { cn } from '@/lib/utils';

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
  tone = 'light',
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  image?: SiteImage;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const dark = tone === 'dark';
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
          'container-yhc grid gap-10 py-14 md:py-24',
          image && 'md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-center md:gap-16',
        )}
      >
        <div>
          {eyebrow ? <p className={cn('eyebrow', dark && 'text-brand-on-dark')}>{eyebrow}</p> : null}
          <h1
            className={cn(
              'display max-w-3xl text-[clamp(2.5rem,1.7rem+3vw,4.25rem)] leading-[1.04]',
              dark && 'text-on-dark',
              eyebrow ? 'mt-4' : null,
            )}
          >
            {title}
          </h1>
          {lede ? (
            <div
              className={cn(
                'mt-6 max-w-2xl text-lg leading-relaxed',
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
              'relative aspect-[4/3] overflow-hidden rounded-2xl md:aspect-[4/5]',
              dark ? 'bg-ink-2' : 'bg-[#efeeeb]',
            )}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
