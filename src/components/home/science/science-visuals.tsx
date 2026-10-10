'use client';

import { motion } from 'motion/react';
import { useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';
import type { PlanTarget } from './types';

/*
 * Scientific illustrations for "The science" chapters. Hand-drawn SVG, general education only — not a
 * diagnosis, not a scan output, not a claim about any product. Every figure has a <title>/<desc>.
 * Animations are transform/opacity/pathLength only, run while `play`, and collapse to the end state for
 * reduced motion.
 */

const EASE = [0.2, 0.7, 0.2, 1] as const;

export interface VisualProps {
  play: boolean;
  reduced: boolean;
}

/** useId() output sanitised for use inside url(#…) references. */
function useSvgId(): string {
  return `s${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

const tr = (reduced: boolean, duration: number, delay = 0) =>
  reduced ? { duration: 0 } : { duration, delay, ease: EASE };

const C = {
  label: '#b9bdc3',
  faint: 'rgba(201,204,209,0.18)',
  line: 'rgba(201,204,209,0.5)',
  accent: '#aebbc8',
  shaft: '#e6e7e9',
  skin: '#3a3d42',
} as const;

function GridDefs({ id }: { id: string }) {
  return (
    <pattern id={`${id}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M20 0 L0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    </pattern>
  );
}

function Label({
  x,
  y,
  children,
  anchor = 'start',
  size = 13,
  fill = C.label,
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
  fill?: string;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={fill} style={{ fontFamily: 'inherit' }}>
      {children}
    </text>
  );
}

/* 01 · A living follicle ------------------------------------------------------------------------- */
export function FollicleVisual({ play, reduced }: VisualProps) {
  const id = useSvgId();
  const on = play || reduced;
  const labels: { d: string; x: number; y: number; text: string; anchor: 'start' | 'end' }[] = [
    { d: 'M214 44 L270 44', x: 276, y: 48, text: 'Hair shaft', anchor: 'start' },
    { d: 'M256 168 L282 168', x: 288, y: 172, text: 'Sebaceous gland', anchor: 'start' },
    { d: 'M182 210 L124 210', x: 118, y: 214, text: 'Follicle', anchor: 'end' },
    { d: 'M177 308 L124 308', x: 118, y: 312, text: 'Hair bulb', anchor: 'end' },
    { d: 'M209 320 L270 336', x: 276, y: 340, text: 'Dermal papilla', anchor: 'start' },
    { d: 'M194 362 L124 372', x: 118, y: 376, text: 'Blood supply', anchor: 'end' },
  ];
  return (
    <svg viewBox="0 0 400 400" role="img" aria-labelledby={`${id}-t ${id}-d`} className="size-full">
      <title id={`${id}-t`}>A hair follicle in cross-section</title>
      <desc id={`${id}-d`}>
        A single hair follicle beneath the skin. The hair shaft rises from a bulb deep in the skin. At the
        base of the bulb sits the dermal papilla, supplied by small blood vessels, which signals the root to
        grow. A sebaceous gland sits beside the follicle near the surface.
      </desc>
      <defs>
        <GridDefs id={id} />
        <linearGradient id={`${id}-derm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#26292d" />
          <stop offset="1" stopColor="#141517" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#eef3f8" stopOpacity="1" />
          <stop offset="0.45" stopColor={C.accent} stopOpacity="0.7" />
          <stop offset="1" stopColor={C.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}-grid)`} />
      <rect x="0" y="104" width="400" height="296" fill={`url(#${id}-derm)`} />
      <rect x="0" y="98" width="400" height="14" fill={C.skin} />
      <line x1="0" y1="98" x2="400" y2="98" stroke="rgba(242,242,240,0.35)" />
      <Label x={16} y={88} size={11} fill="#8e939a">
        SKIN SURFACE
      </Label>

      {/* Blood supply */}
      {['M200 398 C200 376 184 364 193 340', 'M204 398 C218 378 222 358 208 340'].map((d, i) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke={C.accent}
          strokeOpacity="0.6"
          strokeWidth="1.4"
          initial={false}
          animate={{ pathLength: on ? 1 : 0 }}
          transition={tr(reduced, 1, 0.2 + i * 0.15)}
        />
      ))}

      {/* Follicle sheath, inner root sheath, gland, arrector pili */}
      <path
        d="M182 104 L182 268 Q182 286 170 296 Q164 330 200 336 Q236 330 230 296 Q218 286 218 268 L218 104 Z"
        fill="rgba(201,204,209,0.06)"
        stroke={C.line}
        strokeWidth="1.25"
      />
      <path d="M191 112 L191 282 M209 112 L209 282" stroke={C.faint} strokeDasharray="2 5" />
      <path
        d="M218 148 C246 138 262 154 256 174 C250 192 228 190 218 178"
        fill="rgba(201,204,209,0.08)"
        stroke="rgba(201,204,209,0.42)"
      />
      <path
        d="M224 206 L300 126"
        stroke="#8e939a"
        strokeOpacity="0.35"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Bulb + dermal papilla */}
      <ellipse cx="200" cy="310" rx="24" ry="19" fill={C.skin} stroke={C.line} />
      <motion.circle
        cx="200"
        cy="318"
        r="26"
        fill={`url(#${id}-glow)`}
        initial={false}
        animate={play && !reduced ? { opacity: [0.55, 1, 0.55] } : { opacity: 0.85 }}
        transition={
          play && !reduced ? { duration: 3.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }
        }
      />
      <ellipse cx="200" cy="318" rx="9" ry="10" fill="#dfe5ec" />

      {/* Hair shaft grows up from the bulb */}
      <motion.path
        d="M200 306 L200 98 C200 70 206 46 220 18"
        fill="none"
        stroke={C.shaft}
        strokeWidth="5"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: on ? 1 : 0 }}
        transition={tr(reduced, 1.8, 0.3)}
      />

      {/* Labels */}
      <motion.g initial={false} animate={{ opacity: on ? 1 : 0 }} transition={tr(reduced, 0.6, 1.2)}>
        {labels.map((l) => (
          <g key={l.text}>
            <path d={l.d} stroke="rgba(185,189,195,0.55)" strokeWidth="1" fill="none" />
            <Label x={l.x} y={l.y} anchor={l.anchor}>
              {l.text}
            </Label>
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

/* 02 · The hair cycle ---------------------------------------------------------------------------- */
const PHASES = [
  {
    name: 'Anagen',
    role: 'Growth',
    detail: 'The root is deep and active. Most follicles are in this phase at any time, often for years.',
    from: 6,
    to: 286,
    scale: 1,
    papilla: 0,
  },
  {
    name: 'Catagen',
    role: 'Transition',
    detail: 'Growth stops and the follicle shrinks upward over a few weeks.',
    from: 294,
    to: 310,
    scale: 0.66,
    papilla: -44,
  },
  {
    name: 'Telogen',
    role: 'Rest',
    detail: 'The hair rests, then sheds — and a living root can begin a new growth phase.',
    from: 318,
    to: 354,
    scale: 0.42,
    papilla: -76,
  },
] as const;

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export function CycleVisual({ play, reduced }: VisualProps) {
  const id = useSvgId();
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState(false);
  const phase = step % 3;
  const current = PHASES[phase] ?? PHASES[0];
  const angle = (current.from + current.to) / 2 + 360 * Math.floor(step / 3);

  useEffect(() => {
    if (!play || reduced || picked) return;
    const timer = window.setInterval(() => setStep((s) => s + 1), 2800);
    return () => window.clearInterval(timer);
  }, [play, reduced, picked]);

  const choose = (i: number) => {
    setPicked(true);
    setStep((s) => s + ((i - (s % 3) + 3) % 3));
  };

  return (
    <div className="flex size-full flex-col">
      <svg
        viewBox="0 0 400 400"
        role="img"
        aria-labelledby={`${id}-t ${id}-d`}
        className="min-h-0 w-full flex-1"
      >
        <title id={`${id}-t`}>The hair growth cycle</title>
        <desc id={`${id}-d`}>
          A ring divided into three phases — anagen (growth), catagen (transition) and telogen (rest) — around
          a single follicle. As the cycle moves on, the follicle shrinks upward, rests, and can then start
          growing again from its dermal papilla.
        </desc>
        <defs>
          <GridDefs id={id} />
          <clipPath id={`${id}-clip`}>
            <circle cx="200" cy="200" r="116" />
          </clipPath>
          <radialGradient id={`${id}-glow`}>
            <stop offset="0" stopColor="#eef3f8" />
            <stop offset="1" stopColor={C.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill={`url(#${id}-grid)`} />

        {/* Phase ring */}
        <circle cx="200" cy="200" r="132" fill="none" stroke={C.faint} strokeDasharray="1 5" />
        {PHASES.map((p, i) => (
          <path
            key={p.name}
            d={arc(200, 200, 150, p.from, p.to)}
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            className="transition-[stroke] duration-700"
            stroke={i === phase ? C.shaft : '#3a3d42'}
          />
        ))}
        {PHASES.map((p, i) => {
          const [x, y] = polar(200, 200, 176, (p.from + p.to) / 2);
          return (
            <text
              key={p.name}
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize="13"
              className="transition-[fill] duration-700"
              fill={i === phase ? '#f2f2f0' : '#8e939a'}
              style={{ fontFamily: 'inherit' }}
            >
              {p.name}
            </text>
          );
        })}

        {/* Orbiting marker (rotates around the ring centre; the invisible circle fixes the box) */}
        <motion.g
          initial={false}
          animate={{ rotate: angle }}
          transition={tr(reduced, 1.1)}
          style={{ originX: 0.5, originY: 0.5 }}
        >
          <circle cx="200" cy="200" r="160" fill="none" stroke="none" />
          <circle cx="200" cy="50" r="14" fill={`url(#${id}-glow)`} opacity="0.7" />
          <circle cx="200" cy="50" r="5" fill="#f2f2f0" />
        </motion.g>

        {/* Follicle scene inside the ring */}
        <g clipPath={`url(#${id}-clip)`}>
          <rect x="80" y="80" width="240" height="240" fill="#16181b" />
          <rect x="80" y="150" width="240" height="170" fill="#1f2125" />
          <rect x="80" y="144" width="240" height="10" fill={C.skin} />
          <path
            d="M200 146 C200 120 204 100 214 84"
            stroke={C.shaft}
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <motion.g
            initial={false}
            animate={{ scaleY: current.scale }}
            transition={tr(reduced, 1.1)}
            style={{ originX: 0.5, originY: 0, transformBox: 'fill-box' }}
          >
            <path
              d="M186 150 L186 246 Q186 260 176 266 Q172 290 200 292 Q228 290 224 266 Q214 260 214 246 L214 150 Z"
              fill="rgba(201,204,209,0.07)"
              stroke={C.line}
            />
            <line
              x1="200"
              y1="150"
              x2="200"
              y2="278"
              stroke={C.shaft}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <ellipse cx="200" cy="278" rx="17" ry="12" fill={C.skin} />
          </motion.g>
          <motion.ellipse
            cx="200"
            cy="284"
            rx="7"
            ry="8"
            fill="#dfe5ec"
            initial={false}
            animate={{ y: current.papilla }}
            transition={tr(reduced, 1.1)}
          />
        </g>
        <circle cx="200" cy="200" r="116" fill="none" stroke={C.line} />
      </svg>

      <div className="mt-3 grid shrink-0 grid-cols-3 gap-2" role="group" aria-label="Choose a phase">
        {PHASES.map((p, i) => (
          <button
            key={p.name}
            type="button"
            onClick={() => choose(i)}
            aria-pressed={i === phase}
            className={cn(
              'min-h-12 rounded-xl border px-2 py-2 text-center transition-colors duration-300',
              i === phase
                ? 'border-platinum/60 bg-graphite text-on-dark'
                : 'border-line-dark text-on-dark-muted hover:border-steel hover:text-on-dark',
            )}
          >
            <span className="block text-[11px] tracking-[0.12em] uppercase">{p.role}</span>
            <span className="mt-0.5 block text-[15px] font-medium">{p.name}</span>
          </button>
        ))}
      </div>
      <p
        className="mt-3 min-h-[3em] shrink-0 text-center text-sm leading-relaxed text-on-dark-muted"
        aria-live={picked ? 'polite' : 'off'}
      >
        {current.detail}
      </p>
    </div>
  );
}

/* 03 · Miniaturisation --------------------------------------------------------------------------- */
const MINI = [
  { cx: 85, scale: 1, label: 'Terminal hair' },
  { cx: 200, scale: 0.7, label: 'Thinner' },
  { cx: 315, scale: 0.44, label: 'Miniaturised' },
] as const;

function folliclePath(cx: number): string {
  return `M${cx - 16} 150 L${cx - 16} 262 Q${cx - 16} 276 ${cx - 26} 284 Q${cx - 30} 312 ${cx} 314 Q${cx + 30} 312 ${cx + 26} 284 Q${cx + 16} 276 ${cx + 16} 262 L${cx + 16} 150 Z`;
}

export function MiniaturisationVisual({ play, reduced }: VisualProps) {
  const id = useSvgId();
  const on = play || reduced;
  return (
    <svg viewBox="0 0 400 400" role="img" aria-labelledby={`${id}-t ${id}-d`} className="size-full">
      <title id={`${id}-t`}>Follicle miniaturisation</title>
      <desc id={`${id}-d`}>
        Three follicles side by side. The first is a full-size terminal follicle with a thick hair. The second
        is smaller with a thinner hair. The third has miniaturised and produces a short, fine hair.
      </desc>
      <defs>
        <GridDefs id={id} />
        <linearGradient id={`${id}-derm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#26292d" />
          <stop offset="1" stopColor="#141517" />
        </linearGradient>
        <marker
          id={`${id}-arrow`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 Z" fill="#8e939a" />
        </marker>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}-grid)`} />
      <rect x="0" y="150" width="400" height="180" fill={`url(#${id}-derm)`} />
      <rect x="0" y="144" width="400" height="10" fill={C.skin} />
      {[142, 258].map((x) => (
        <line key={x} x1={x} y1="30" x2={x} y2="330" stroke={C.faint} strokeDasharray="3 6" />
      ))}

      {MINI.map((m, i) => {
        const scale = on ? m.scale : 1;
        return (
          <g key={m.label}>
            {/* Shaft above the skin — anchored at its base */}
            <motion.g
              initial={false}
              animate={{ scale }}
              transition={tr(reduced, 1.4, 0.3 + i * 0.25)}
              style={{ originX: 0.5, originY: 1, transformBox: 'fill-box' }}
            >
              <path
                d={`M${m.cx} 148 C${m.cx} 110 ${m.cx + 4} 76 ${m.cx + 14} 44`}
                stroke={C.shaft}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </motion.g>
            {/* Follicle below the skin — anchored at the surface */}
            <motion.g
              initial={false}
              animate={{ scale }}
              transition={tr(reduced, 1.4, 0.3 + i * 0.25)}
              style={{ originX: 0.5, originY: 0, transformBox: 'fill-box' }}
            >
              <path d={folliclePath(m.cx)} fill="rgba(201,204,209,0.06)" stroke={C.line} strokeWidth="1.25" />
              <line
                x1={m.cx}
                y1="150"
                x2={m.cx}
                y2="292"
                stroke={C.shaft}
                strokeWidth="6"
                strokeLinecap="round"
              />
              <ellipse cx={m.cx} cy="298" rx="20" ry="14" fill={C.skin} />
              <ellipse cx={m.cx} cy="304" rx="7" ry="8" fill="#dfe5ec" />
            </motion.g>
            <Label x={m.cx} y={358} anchor="middle" fill={i === 0 ? '#f2f2f0' : C.label}>
              {m.label}
            </Label>
          </g>
        );
      })}
      <line
        x1="60"
        y1="382"
        x2="340"
        y2="382"
        stroke="#8e939a"
        strokeWidth="1"
        markerEnd={`url(#${id}-arrow)`}
      />
      <Label x={200} y={24} anchor="middle" size={11} fill="#8e939a">
        SHORTER GROWTH PHASES · FINER HAIRS
      </Label>
    </svg>
  );
}

/* 04 · Why we scan first ------------------------------------------------------------------------- */
function rand(i: number): number {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const SCAR = { cx: 284, cy: 262, rx: 76, ry: 58 };

const OPENINGS = Array.from({ length: 9 * 8 }, (_, i) => {
  const col = i % 9;
  const row = Math.floor(i / 9);
  const x = 52 + col * 37 + (rand(i) - 0.5) * 16;
  const y = 62 + row * 38 + (rand(i + 100) - 0.5) * 16;
  const angle = -60 + rand(i + 200) * 40;
  const pair = rand(i + 300) > 0.6;
  return { x, y, angle, pair };
}).filter((o) => ((o.x - SCAR.cx) / (SCAR.rx + 8)) ** 2 + ((o.y - SCAR.cy) / (SCAR.ry + 8)) ** 2 > 1);

export function ScanFieldVisual({ play, reduced }: VisualProps) {
  const id = useSvgId();
  const on = play || reduced;
  const roots = [OPENINGS[12], OPENINGS[30]].filter((o): o is (typeof OPENINGS)[number] => Boolean(o));
  return (
    <svg viewBox="0 0 400 400" role="img" aria-labelledby={`${id}-t ${id}-d`} className="size-full">
      <title id={`${id}-t`}>Looking at the roots from above</title>
      <desc id={`${id}-d`}>
        A top-down view of a scalp. Most of the area shows follicle openings with hairs growing from living
        roots. One smooth patch has no follicle openings: a scarred area, where follicles can no longer grow
        hair. A scanning line moves across the field.
      </desc>
      <defs>
        <GridDefs id={id} />
        <radialGradient id={`${id}-scalp`} cx="0.45" cy="0.45" r="0.7">
          <stop offset="0" stopColor="#2a2d31" />
          <stop offset="1" stopColor="#16181b" />
        </radialGradient>
        <radialGradient id={`${id}-scar`}>
          <stop offset="0" stopColor="#4a4e55" stopOpacity="0.85" />
          <stop offset="1" stopColor="#2a2d31" stopOpacity="0.15" />
        </radialGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.accent} stopOpacity="0" />
          <stop offset="1" stopColor={C.accent} stopOpacity="0.22" />
        </linearGradient>
        <clipPath id={`${id}-frame`}>
          <rect x="20" y="20" width="360" height="360" rx="20" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-frame)`}>
        <rect x="20" y="20" width="360" height="360" fill={`url(#${id}-scalp)`} />
        <rect x="20" y="20" width="360" height="360" fill={`url(#${id}-grid)`} />

        <ellipse
          cx={SCAR.cx}
          cy={SCAR.cy}
          rx={SCAR.rx}
          ry={SCAR.ry}
          fill={`url(#${id}-scar)`}
          stroke={C.accent}
          strokeOpacity="0.55"
          strokeDasharray="4 5"
        />
        <Label x={SCAR.cx} y={SCAR.cy - 4} anchor="middle" size={12} fill="#f2f2f0">
          Scarred area
        </Label>
        <Label x={SCAR.cx} y={SCAR.cy + 13} anchor="middle" size={11}>
          no follicle openings
        </Label>

        {OPENINGS.map((o, i) => (
          <g key={i}>
            <circle cx={o.x} cy={o.y} r="3.4" fill="#0b0c0d" stroke="rgba(201,204,209,0.45)" />
            {[0, o.pair ? 14 : null].map((offset) =>
              offset === null ? null : (
                <line
                  key={offset}
                  x1={o.x}
                  y1={o.y}
                  x2={o.x + Math.cos(((o.angle + offset) * Math.PI) / 180) * 11}
                  y2={o.y + Math.sin(((o.angle + offset) * Math.PI) / 180) * 11}
                  stroke="#c9ccd1"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              ),
            )}
          </g>
        ))}

        {/* Living-root reticles */}
        <motion.g initial={false} animate={{ opacity: on ? 1 : 0 }} transition={tr(reduced, 0.6, 0.8)}>
          {roots.map((o, i) => (
            <g key={i}>
              <circle cx={o.x} cy={o.y} r="14" fill="none" stroke="#f2f2f0" strokeWidth="1.2" />
              <path
                d={`M${o.x} ${o.y - 20} V${o.y - 16} M${o.x} ${o.y + 16} V${o.y + 20} M${o.x - 20} ${o.y} H${o.x - 16} M${o.x + 16} ${o.y} H${o.x + 20}`}
                stroke="#f2f2f0"
                strokeWidth="1.2"
              />
            </g>
          ))}
          {roots[0] ? (
            <g>
              <rect
                x={roots[0].x + 22}
                y={roots[0].y - 11}
                width="86"
                height="22"
                rx="11"
                fill="#121315"
                stroke={C.line}
              />
              <Label x={roots[0].x + 65} y={roots[0].y + 4} anchor="middle" size={11} fill="#f2f2f0">
                Living root
              </Label>
            </g>
          ) : null}
        </motion.g>

        {/* Scan beam */}
        <motion.g
          initial={false}
          animate={play && !reduced ? { x: [0, 360] } : { x: 250 }}
          transition={
            play && !reduced
              ? { duration: 4.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }
              : { duration: 0 }
          }
        >
          <rect x="-20" y="20" width="40" height="360" fill={`url(#${id}-beam)`} />
          <rect x="19" y="20" width="1.5" height="360" fill="#eef3f8" opacity="0.85" />
        </motion.g>
      </g>
      <rect x="20" y="20" width="360" height="360" rx="20" fill="none" stroke={C.line} />
      <Label x={36} y={44} size={11} fill="#8e939a">
        TOP-DOWN VIEW · ILLUSTRATIVE
      </Label>
    </svg>
  );
}

/* 05 · What a plan targets ----------------------------------------------------------------------- */
export function PlanTargetsVisual({ play, reduced, targets }: VisualProps & { targets: PlanTarget[] }) {
  const id = useSvgId();
  const on = play || reduced;
  const n = Math.max(targets.length, 1);
  const nodes = targets.map((t, i) => {
    const deg = (360 / n) * i;
    const [x, y] = polar(200, 200, 132, deg);
    const above = Math.cos((deg * Math.PI) / 180) > 0.3;
    return {
      ...t,
      x,
      y,
      lx: Math.min(318, Math.max(82, x)),
      ly: above ? y - 30 : y + 40,
    };
  });
  return (
    <svg viewBox="0 0 400 400" role="img" aria-labelledby={`${id}-t ${id}-d`} className="size-full">
      <title id={`${id}-t`}>What a doctor-prescribed plan works on</title>
      <desc id={`${id}-d`}>
        {`A follicle at the centre, connected to the parts of a plan a doctor may prescribe: ${targets
          .map((t) => t.product)
          .join(', ')}.`}
      </desc>
      <defs>
        <GridDefs id={id} />
        <radialGradient id={`${id}-core`}>
          <stop offset="0" stopColor="#2a2d31" />
          <stop offset="1" stopColor="#16181b" />
        </radialGradient>
        <linearGradient id={`${id}-silver`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#edeef0" />
          <stop offset="0.55" stopColor="#c9ccd1" />
          <stop offset="1" stopColor="#aeb2b8" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill={`url(#${id}-grid)`} />
      <circle cx="200" cy="200" r="132" fill="none" stroke={C.faint} strokeDasharray="2 6" />
      <circle cx="200" cy="200" r="86" fill="none" stroke={C.faint} />

      {nodes.map((nd, i) => (
        <motion.line
          key={nd.slug}
          x1="200"
          y1="200"
          x2={nd.x}
          y2={nd.y}
          stroke={C.accent}
          strokeOpacity="0.7"
          strokeWidth="1.2"
          initial={false}
          animate={{ pathLength: on ? 1 : 0 }}
          transition={tr(reduced, 0.8, 0.3 + i * 0.2)}
        />
      ))}

      <circle
        cx="200"
        cy="200"
        r="54"
        fill={`url(#${id}-core)`}
        stroke={`url(#${id}-silver)`}
        strokeWidth="1.5"
      />
      <path d="M200 166 L200 206" stroke={C.shaft} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="200" cy="211" rx="10" ry="8" fill={C.skin} stroke={C.line} />
      <ellipse cx="200" cy="214" rx="4" ry="4.5" fill="#dfe5ec" />
      <Label x={200} y={238} anchor="middle" size={11}>
        Your follicle
      </Label>

      {nodes.map((nd, i) => (
        <motion.g
          key={nd.slug}
          initial={false}
          animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.6 }}
          transition={tr(reduced, 0.5, 0.8 + i * 0.2)}
          style={{ originX: 0.5, originY: 0.5, transformBox: 'fill-box' }}
        >
          <circle cx={nd.x} cy={nd.y} r="20" fill="#1c1e21" stroke={`url(#${id}-silver)`} strokeWidth="1.5" />
          <text
            x={nd.x}
            y={nd.y + 4.5}
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill="#f2f2f0"
            style={{ fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }}
          >
            {String(i + 1).padStart(2, '0')}
          </text>
          <Label x={nd.lx} y={nd.ly} anchor="middle" fill="#f2f2f0">
            {nd.product}
          </Label>
        </motion.g>
      ))}
    </svg>
  );
}
