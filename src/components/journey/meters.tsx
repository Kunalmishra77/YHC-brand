import type { ScalpZone } from '@/lib/journey/types';
import { ZONE_LABEL } from '@/lib/journey/labels';
import { cn } from '@/lib/utils';

/** Circular 0–100 meter. Value is always printed as words/number too (never colour alone). */
export function ProgressRing({
  value,
  size = 112,
  stroke = 8,
  tone = 'light',
  label,
  children,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: 'light' | 'dark';
  /** accessible name, e.g. "Root density 68 out of 100" */
  label?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  const gradientId = `ring-${tone}`;
  return (
    <div
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop
              offset="0%"
              style={{ stopColor: tone === 'dark' ? 'var(--yhc-text-on-dark)' : 'var(--yhc-accent)' }}
            />
            <stop
              offset="100%"
              style={{ stopColor: tone === 'dark' ? 'var(--yhc-platinum)' : 'var(--yhc-steel)' }}
            />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          className={tone === 'dark' ? 'stroke-white/12' : 'stroke-mist'}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v / 100)}
          className="transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

/** Three-step level meter (e.g. miniaturisation low / moderate / high). */
export function LevelMeter({
  levels,
  active,
  invert = false,
}: {
  levels: readonly string[];
  /** index of the active level */
  active: number;
  /** true when a higher level is worse (colours run good → caution) */
  invert?: boolean;
}) {
  return (
    <div>
      <div className="flex gap-1" aria-hidden>
        {levels.map((l, i) => (
          <span
            key={l}
            className={cn(
              'h-2 flex-1 rounded-full',
              i <= active
                ? invert
                  ? i === 0
                    ? 'bg-success'
                    : i === 1
                      ? 'bg-warning'
                      : 'bg-danger'
                  : 'bg-brand'
                : 'bg-mist',
            )}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[12px] text-muted-foreground">
        {levels.map((l, i) => (
          <span key={l} className={cn(i === active && 'font-semibold text-ink')}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Top-down scalp map; highlighted zones are where the scan found thinning. */
export function ScalpMap({ areas, className }: { areas: ScalpZone[]; className?: string }) {
  const on = (z: ScalpZone) => areas.includes(z);
  const zone = (z: ScalpZone) =>
    cn('transition-colors', on(z) ? 'fill-warning/45 stroke-warning' : 'fill-mist/70 stroke-line');
  return (
    <figure className={cn('flex flex-col items-center', className)}>
      <svg viewBox="0 0 200 230" className="w-full max-w-[220px]" role="img" aria-labelledby="scalp-map-cap">
        {/* nose marker = front */}
        <path d="M92 14l8-10 8 10" className="fill-none stroke-steel" strokeWidth="1.5" />
        <ellipse cx="100" cy="120" rx="80" ry="100" className="fill-card stroke-steel" strokeWidth="1.5" />
        {/* hairline band */}
        <path
          d="M44 62c30-30 82-30 112 0l-10 16c-26-22-66-22-92 0z"
          className={zone('hairline')}
          strokeWidth="1.2"
        />
        {/* temples */}
        <path
          d="M30 86c4-10 8-16 14-24l10 16c-4 6-7 12-9 20z"
          className={zone('temples')}
          strokeWidth="1.2"
        />
        <path
          d="M170 86c-4-10-8-16-14-24l-10 16c4 6 7 12 9 20z"
          className={zone('temples')}
          strokeWidth="1.2"
        />
        {/* mid-scalp */}
        <path d="M54 78c26-22 66-22 92 0l6 50H48z" className={zone('mid_scalp')} strokeWidth="1.2" />
        {/* parting */}
        <rect x="95" y="60" width="10" height="110" rx="5" className={zone('parting')} strokeWidth="1.2" />
        {/* crown */}
        <circle cx="100" cy="166" r="30" className={zone('crown')} strokeWidth="1.2" />
        <text x="100" y="226" textAnchor="middle" className="fill-muted-foreground" fontSize="10">
          Back of head
        </text>
      </svg>
      <figcaption id="scalp-map-cap" className="mt-2 text-center text-[13px] text-body">
        {areas.length ? (
          <>
            <span
              className="mr-1.5 inline-block size-2.5 translate-y-px rounded-sm border border-warning bg-warning/45"
              aria-hidden
            />
            Thinning seen at: {areas.map((a) => ZONE_LABEL[a]).join(', ')}
          </>
        ) : (
          'No thinning areas marked'
        )}
      </figcaption>
    </figure>
  );
}
