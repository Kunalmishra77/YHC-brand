import 'server-only';

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

/*
 * Branded 1200×630 Open Graph / Twitter cards (SEO-02), rendered with next/og at the
 * `opengraph-image.tsx` file conventions.
 *
 * - No network at build or request time: the serif display face (Cormorant Garamond, SIL OFL —
 *   see ./fonts/OFL.txt) and every image are read from the repo.
 * - next/og (satori) only decodes PNG, JPEG and GIF — not WebP. The logo and pack photos are WebP,
 *   so cards use the PNG badge (`src/app/icon.png`) + a text wordmark, and only JPEG backdrops from
 *   `public/media/img`, or the JPEG pack crops in `public/media/products/og` (scripts/build-assets.mjs).
 * - No patient photos, no clinical claims; copy follows PRD §15.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = 'image/png';
export const OG_ALT = 'Your Hair Company — doctor-led hair care';

const C = {
  obsidian: '#121315',
  pearl: '#f5f3ee',
  muted: '#b9bac0',
  silver: '#8e9097',
  line: 'rgba(245,243,238,0.16)',
} as const;

/** JPEG backdrops in `public/media/img` (JPEG only — see note above). */
export type OgBackdrop = 'microscope' | 'cellular' | 'hairMacro' | 'formulation' | 'guarantee';

const BACKDROP_FILE: Record<OgBackdrop, string> = {
  microscope: 'poster-hero-microscope.jpg',
  cellular: 'poster-science-cellular.jpg',
  hairMacro: 'hair-macro-2.jpg',
  formulation: 'poster-journey-formulation.jpg',
  guarantee: 'poster-guarantee-bubbles.jpg',
};

async function dataUri(path: string, mime: 'image/jpeg' | 'image/png'): Promise<string | null> {
  try {
    const buf = await readFile(join(process.cwd(), path));
    return `data:${mime};base64,${buf.toString('base64')}`;
  } catch {
    // A missing asset must never break a share card; render without it.
    return null;
  }
}

async function serifFont(): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), 'src/server/og/fonts/CormorantGaramond-Medium.ttf'));
  } catch {
    return null;
  }
}

export interface BrandCardInput {
  /** Small uppercase label above the headline, e.g. "Hair concern". */
  eyebrow: string;
  /** Serif display headline (keep under ~60 characters). */
  title: string;
  /** One supporting line. */
  subtitle?: string;
  /** Optional detail chips under the subtitle, e.g. pack size. */
  chips?: string[];
  backdrop?: OgBackdrop;
  /** Repo-relative JPEG shown on the right instead of a backdrop (e.g. a pack shot). */
  photo?: string;
}

/** Render one branded share card. */
export async function brandCard({ eyebrow, title, subtitle, chips = [], backdrop, photo: photoPath }: BrandCardInput) {
  const [font, badge, photo] = await Promise.all([
    serifFont(),
    dataUri('src/app/icon.png', 'image/png'),
    photoPath
      ? dataUri(photoPath, 'image/jpeg')
      : backdrop
        ? dataUri(`public/media/img/${BACKDROP_FILE[backdrop]}`, 'image/jpeg')
        : Promise.resolve(null),
  ]);
  const titleSize = title.length > 42 ? 64 : title.length > 26 || photo ? 76 : 88;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: C.obsidian,
          color: C.pearl,
          fontFamily: font ? 'Cormorant' : undefined,
        }}
      >
        {photo ? (
          <div style={{ position: 'absolute', top: 0, right: 0, width: 520, height: 630, display: 'flex' }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img> */}
            <img src={photo} alt="" width={520} height={630} style={{ width: 520, height: 630, objectFit: 'cover' }} />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 520,
                height: 630,
                display: 'flex',
                backgroundImage: `linear-gradient(90deg, ${C.obsidian} 0%, rgba(18,19,21,0.6) 35%, rgba(18,19,21,0.1) 100%)`,
              }}
            />
          </div>
        ) : null}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: photo ? 700 : 1200,
            height: '100%',
            padding: '64px 72px',
          }}
        >
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {badge ? (
              // eslint-disable-next-line @next/next/no-img-element -- next/og renders plain <img>
              <img src={badge} alt="" width={52} height={52} style={{ borderRadius: 12 }} />
            ) : null}
            <div style={{ display: 'flex', fontSize: 26, letterSpacing: 4, color: C.pearl }}>
              YHC · YOUR HAIR COMPANY
            </div>
          </div>

          {/* Headline block */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 24, letterSpacing: 5, color: C.silver }}>
              {eyebrow.toUpperCase()}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 18,
                fontSize: titleSize,
                lineHeight: 1.04,
                color: C.pearl,
                maxWidth: photo ? 580 : 1000,
              }}
            >
              {title}
            </div>
            {subtitle ? (
              <div
                style={{
                  display: 'flex',
                  marginTop: 22,
                  fontSize: 32,
                  lineHeight: 1.25,
                  color: C.muted,
                  maxWidth: photo ? 560 : 900,
                }}
              >
                {subtitle}
              </div>
            ) : null}
            {chips.length ? (
              <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
                {chips.map((chip) => (
                  <div
                    key={chip}
                    style={{
                      display: 'flex',
                      padding: '6px 18px',
                      border: `1px solid ${C.line}`,
                      borderRadius: 999,
                      fontSize: 24,
                      color: C.pearl,
                    }}
                  >
                    {chip}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: `1px solid ${C.line}`,
              paddingTop: 22,
              fontSize: 24,
              color: C.muted,
            }}
          >
            <div style={{ display: 'flex' }}>Science-first, doctor-led hair care</div>
            <div style={{ display: 'flex' }}>yourhaircompany.com</div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: font ? [{ name: 'Cormorant', data: font, weight: 500, style: 'normal' }] : undefined,
    },
  );
}
