import { cn } from '@/lib/utils';

/** Placeholder for a stored progress photo (demo has no files): graphite tile with angle + date. */
export function PhotoTile({ angle, date, className }: { angle: string; date: string; className?: string }) {
  return (
    <figure
      className={cn(
        'relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-lg bg-gradient-to-br from-graphite via-ink-2 to-obsidian p-2.5 text-on-dark sm:p-3',
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(201,204,209,0.18),transparent_60%)]"
      />
      <figcaption className="relative">
        <span className="block text-[13px] leading-tight font-medium">{angle}</span>
        <span className="block text-[12px] text-on-dark-muted">{date}</span>
      </figcaption>
    </figure>
  );
}
