import { cn } from '@/lib/utils';

/**
 * Thin line-art head diagrams (side profile and top view) with the area each hair-loss pattern usually
 * affects shaded and marked with a dot — in the style of the scan app's capture guides. Static SVG; the
 * marker's pulse is CSS-only and removed under prefers-reduced-motion. Illustrative, not a diagnosis.
 */

export type ScalpPattern = 'male' | 'female' | 'diffuse' | 'patches' | 'traction' | 'scarring';
export type HeadView = 'side' | 'top';

type Zone =
  | { kind: 'ellipse'; cx: number; cy: number; rx: number; ry: number }
  | { kind: 'path'; d: string; cx: number; cy: number }
  | { kind: 'band'; d: string; cx: number; cy: number; width: number };

/* Side profile facing left, viewBox 0 0 160 180. */
const SIDE_HEAD =
  'M110 176C108 160 110 148 117 139C132 123 140 101 138 79C135 42 110 18 80 18C52 18 34 36 32 60C31 68 32 74 30 80L20 99C19 101 21 103 24 103L28 104C28 108 26 112 28 116C30 120 28 124 30 128C32 136 40 140 52 140L60 150L62 176';
const SIDE_EAR = 'M96 80C104 74 112 80 111 92C110 101 103 106 97 103';
const SIDE_HAIRLINE = 'M37 44C46 50 56 56 64 66C70 74 78 76 90 72';

/* Top view, front at the top, viewBox 0 0 160 180. */
const TOP_NOSE = 'M72 30L80 17L88 30';
const TOP_EAR_L = 'M24 84Q14 100 24 116';
const TOP_EAR_R = 'M136 84Q146 100 136 116';

const SCAR_TOP = 'M70 72C80 64 96 68 100 80C104 92 98 106 86 108C74 110 62 102 62 90C62 82 64 76 70 72Z';
const SCAR_SIDE = 'M84 26C94 20 108 24 110 34C112 42 104 48 94 48C84 48 78 42 78 36C78 31 80 28 84 26Z';

const ZONES: Record<ScalpPattern, Record<HeadView, Zone[]>> = {
  male: {
    side: [
      { kind: 'ellipse', cx: 50, cy: 42, rx: 13, ry: 11 },
      { kind: 'ellipse', cx: 112, cy: 38, rx: 16, ry: 12 },
    ],
    top: [
      { kind: 'ellipse', cx: 80, cy: 120, rx: 20, ry: 18 },
      { kind: 'ellipse', cx: 54, cy: 46, rx: 13, ry: 11 },
      { kind: 'ellipse', cx: 106, cy: 46, rx: 13, ry: 11 },
    ],
  },
  female: {
    side: [{ kind: 'ellipse', cx: 76, cy: 26, rx: 26, ry: 9 }],
    top: [{ kind: 'ellipse', cx: 80, cy: 88, rx: 13, ry: 38 }],
  },
  diffuse: {
    side: [{ kind: 'ellipse', cx: 86, cy: 52, rx: 44, ry: 30 }],
    top: [{ kind: 'ellipse', cx: 80, cy: 98, rx: 48, ry: 62 }],
  },
  patches: {
    side: [{ kind: 'ellipse', cx: 104, cy: 62, rx: 10, ry: 10 }],
    top: [
      { kind: 'ellipse', cx: 60, cy: 88, rx: 12, ry: 12 },
      { kind: 'ellipse', cx: 102, cy: 128, rx: 8, ry: 8 },
    ],
  },
  traction: {
    side: [{ kind: 'band', d: 'M36 46C44 52 52 58 58 66', cx: 46, cy: 54, width: 9 }],
    top: [{ kind: 'band', d: 'M30 80C32 50 54 34 80 34C106 34 128 50 130 80', cx: 80, cy: 34, width: 9 }],
  },
  scarring: {
    side: [{ kind: 'path', d: SCAR_SIDE, cx: 94, cy: 36 }],
    top: [{ kind: 'path', d: SCAR_TOP, cx: 82, cy: 88 }],
  },
};

const LINE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

function ZoneShape({ zone }: { zone: Zone }) {
  const fill = { fill: 'var(--yhc-accent)', fillOpacity: 0.16, stroke: 'var(--yhc-accent)', strokeWidth: 1 };
  if (zone.kind === 'ellipse')
    return <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry} {...fill} />;
  if (zone.kind === 'path') return <path d={zone.d} {...fill} strokeDasharray="3 3" />;
  return (
    <path
      d={zone.d}
      fill="none"
      stroke="var(--yhc-accent)"
      strokeOpacity={0.22}
      strokeWidth={zone.width}
      strokeLinecap="round"
    />
  );
}

export function HeadDiagram({
  pattern,
  view,
  title,
  showZones = true,
  className,
}: {
  pattern: ScalpPattern;
  view: HeadView;
  /** Accessible title; omit for decorative use. */
  title?: string;
  showZones?: boolean;
  className?: string;
}) {
  const zones = showZones ? ZONES[pattern][view] : [];
  const marker = zones[0];
  const titleId = title ? `head-${view}-${pattern}` : undefined;

  return (
    <svg
      viewBox="0 0 160 180"
      className={cn('h-auto w-full text-ink', className)}
      role={title ? 'img' : undefined}
      aria-labelledby={titleId}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {zones.map((z, i) => (
        <ZoneShape key={i} zone={z} />
      ))}
      {view === 'side' ? (
        <>
          <path d={SIDE_HEAD} {...LINE} />
          <path d={SIDE_EAR} {...LINE} />
          <path d={SIDE_HAIRLINE} {...LINE} strokeOpacity={0.45} strokeDasharray="2 3" />
        </>
      ) : (
        <>
          <ellipse cx="80" cy="98" rx="56" ry="70" {...LINE} />
          <path d={TOP_NOSE} {...LINE} />
          <path d={TOP_EAR_L} {...LINE} />
          <path d={TOP_EAR_R} {...LINE} />
          {pattern === 'female' && showZones ? (
            <path d="M80 50L80 128" {...LINE} strokeOpacity={0.55} strokeDasharray="2 3" />
          ) : null}
        </>
      )}
      {marker ? (
        <g>
          <circle
            cx={marker.cx}
            cy={marker.cy}
            r="4"
            fill="var(--yhc-accent)"
            className="origin-center [transform-box:fill-box] motion-safe:animate-[ping_2.6s_cubic-bezier(0,0,0.2,1)_infinite]"
            opacity="0.5"
          />
          <circle cx={marker.cx} cy={marker.cy} r="4" fill="var(--yhc-accent)" />
        </g>
      ) : null}
    </svg>
  );
}
