import { cn } from '@/lib/utils';

/**
 * Hand-drawn SVG of the hair growth cycle (general education, not a diagnosis): three follicles in
 * cross-section — anagen, catagen, telogen — with the dermal papilla that a new cycle grows from.
 * Labels live in HTML below the drawing so they stay readable at 360 px.
 */
const PHASES = [
  {
    name: 'Anagen',
    role: 'Growth',
    detail: 'The root is deep and active. Most hairs are here, often for years.',
  },
  { name: 'Catagen', role: 'Transition', detail: 'Growth stops and the follicle shrinks over a few weeks.' },
  {
    name: 'Telogen',
    role: 'Rest',
    detail: 'The hair rests, then sheds — and a living root can start again.',
  },
] as const;

export function HairCycleDiagram({
  className,
  tone = 'light',
}: {
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';
  return (
    <figure className={cn('w-full', className)}>
      <svg
        viewBox="0 0 720 380"
        role="img"
        aria-labelledby="hair-cycle-title hair-cycle-desc"
        className="h-auto w-full"
      >
        <title id="hair-cycle-title">The hair growth cycle</title>
        <desc id="hair-cycle-desc">
          Three hair follicles in cross-section. In anagen the root reaches deep into the skin with a large
          bulb around the dermal papilla. In catagen the follicle shrinks upward. In telogen a short club hair
          rests near the surface while the papilla waits below, ready to start a new growth phase.
        </desc>

        {/* Skin layers */}
        <rect x="0" y="80" width="720" height="18" className={dark ? 'fill-[#3a3d42]' : 'fill-[#e6e2dc]'} />
        <rect x="0" y="98" width="720" height="194" className={dark ? 'fill-[#24272b]' : 'fill-[#f4f2ef]'} />
        <rect x="0" y="292" width="720" height="48" className={dark ? 'fill-[#1c1e21]' : 'fill-[#efe9df]'} />
        {Array.from({ length: 18 }, (_, i) => (
          <circle
            key={i}
            cx={20 + i * 40}
            cy={316 + (i % 2) * 6}
            r={14}
            className={dark ? 'fill-[#25282c]' : 'fill-[#f6f1e8]'}
          />
        ))}
        <line
          x1="240"
          y1="20"
          x2="240"
          y2="340"
          strokeDasharray="3 6"
          className="stroke-steel/50"
          strokeWidth="1"
        />
        <line
          x1="480"
          y1="20"
          x2="480"
          y2="340"
          strokeDasharray="3 6"
          className="stroke-steel/50"
          strokeWidth="1"
        />

        {/* Anagen */}
        <g>
          <path
            d="M106 98 L106 240 Q106 262 94 270 Q90 294 120 298 Q150 294 146 270 Q134 262 134 240 L134 98 Z"
            className={dark ? 'fill-[#2e3136] stroke-steel' : 'fill-white stroke-steel'}
            strokeWidth="1.5"
          />
          <ellipse cx="146" cy="138" rx="9" ry="14" className="fill-[#e9dcc6] stroke-steel" strokeWidth="1" />
          <ellipse cx="120" cy="276" rx="20" ry="15" className="fill-[#cfc7bb]" />
          <ellipse cx="120" cy="284" rx="8" ry="9" className="fill-brand" />
          <path
            d="M120 272 L120 98 C120 70 124 46 136 16"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            className={dark ? 'stroke-platinum' : 'stroke-obsidian'}
          />
        </g>

        {/* Catagen */}
        <g>
          <path
            d="M346 98 L346 182 Q346 208 360 208 Q374 208 374 182 L374 98 Z"
            className={dark ? 'fill-[#2e3136] stroke-steel' : 'fill-white stroke-steel'}
            strokeWidth="1.5"
          />
          <ellipse cx="386" cy="132" rx="8" ry="12" className="fill-[#e9dcc6] stroke-steel" strokeWidth="1" />
          <ellipse cx="360" cy="196" rx="12" ry="10" className="fill-[#cfc7bb]" />
          <line
            x1="360"
            y1="208"
            x2="360"
            y2="244"
            strokeDasharray="3 4"
            strokeWidth="2"
            className="stroke-steel"
          />
          <ellipse cx="360" cy="252" rx="8" ry="7" className="fill-brand" />
          <path
            d="M360 196 L360 98 C360 70 364 46 376 16"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            className={dark ? 'stroke-platinum' : 'stroke-obsidian'}
          />
        </g>

        {/* Telogen */}
        <g>
          <path
            d="M588 98 L588 146 Q588 160 600 160 Q612 160 612 146 L612 98 Z"
            className={dark ? 'fill-[#2e3136] stroke-steel' : 'fill-white stroke-steel'}
            strokeWidth="1.5"
          />
          <ellipse cx="624" cy="128" rx="8" ry="11" className="fill-[#e9dcc6] stroke-steel" strokeWidth="1" />
          <circle cx="600" cy="150" r="7" className="fill-[#cfc7bb] stroke-steel" strokeWidth="1" />
          <ellipse cx="600" cy="178" rx="7" ry="6" className="fill-brand" />
          <path
            d="M600 148 L600 98 C600 74 603 56 610 40"
            fill="none"
            strokeWidth="5"
            strokeLinecap="round"
            className={dark ? 'stroke-platinum' : 'stroke-obsidian'}
          />
        </g>

        {/* Cycle arrows */}
        <path d="M206 44 L274 44" strokeWidth="1.5" className="stroke-steel" markerEnd="url(#hc-arrow)" />
        <path d="M446 44 L514 44" strokeWidth="1.5" className="stroke-steel" markerEnd="url(#hc-arrow)" />
        <path
          d="M600 344 C600 374 120 374 120 344"
          fill="none"
          strokeWidth="1.5"
          strokeDasharray="5 5"
          className="stroke-brand"
          markerEnd="url(#hc-arrow-brand)"
        />
        <defs>
          <marker
            id="hc-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0 0 L10 5 L0 10 Z" className="fill-steel" />
          </marker>
          <marker
            id="hc-arrow-brand"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0 0 L10 5 L0 10 Z" className="fill-brand" />
          </marker>
        </defs>
      </svg>

      <ol className="mt-4 grid grid-cols-3 gap-3 sm:gap-6">
        {PHASES.map((p, i) => (
          <li key={p.name} className="min-w-0">
            <p
              className={cn(
                'text-[11px] font-semibold tracking-[0.12em] uppercase sm:text-xs',
                dark ? 'text-brand-on-dark' : 'text-brand',
              )}
            >
              {i + 1} · {p.role}
            </p>
            <p
              className={cn(
                'mt-1 font-display text-xl leading-tight sm:text-2xl',
                dark ? 'text-on-dark' : 'text-ink',
              )}
            >
              {p.name}
            </p>
            <p
              className={cn(
                'mt-1.5 hidden text-sm leading-relaxed sm:block',
                dark ? 'text-on-dark-muted' : 'text-body',
              )}
            >
              {p.detail}
            </p>
          </li>
        ))}
      </ol>

      <figcaption
        className={cn(
          'mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px]',
          dark ? 'text-on-dark-muted' : 'text-muted-foreground',
        )}
      >
        <Legend swatch={dark ? 'bg-platinum' : 'bg-obsidian'} label="Hair shaft" />
        <Legend swatch="bg-[#cfc7bb]" label="Hair bulb (root)" />
        <Legend swatch="bg-brand" label="Dermal papilla — feeds the root" />
        <span className="flex items-center gap-2">
          <span className="h-0 w-5 border-t-2 border-dashed border-brand" aria-hidden />A new cycle needs a
          living root
        </span>
      </figcaption>
    </figure>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn('size-2.5 rounded-full', swatch)} aria-hidden />
      {label}
    </span>
  );
}
