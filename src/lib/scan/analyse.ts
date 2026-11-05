import type { ZoneAnalysis, ZoneIssue } from './rules';

/*
 * In-browser photo analysis for the scalp scan (ADR-36) — plain pixel maths, no model, no network.
 * Works on a small RGBA copy of the photo (~256 px on the long edge):
 *  1. quality: blur (variance of the Laplacian), too dark / too bright, glare;
 *  2. in the centre of the photo, each pixel is "hair" (dark, outside the skin colour range), "scalp"
 *     (skin colour range, YCrCb) or neither (background, grey/white hair). cover = hair / (hair + scalp);
 *  3. shine = very bright pixels among the scalp pixels (a bare scalp reflects light).
 * Thresholds are first estimates: tune them on consented real photos (TODO(client): pilot photo set).
 * Indicative only — never shown as a diagnosis.
 */

export const ANALYSIS_VERSION = 'cv-1';

const BLUR_MIN = 35; // Laplacian variance below this: too blurry
const DARK_MAX = 45; // mean luma below this: too dark
const BRIGHT_MIN = 228; // mean luma above this: washed out
const GLARE_MAX = 0.22; // share of blown-out pixels above this: glare
const MIN_SUBJECT = 0.35; // hair + scalp must fill at least this share of the centre
const SHINE_LUMA = 212;

export interface PixelImage {
  data: Uint8ClampedArray | Uint8Array;
  width: number;
  height: number;
}

export interface PixelAnalysis extends ZoneAnalysis {
  quality: { blur: number; brightness: number; glare: number };
}

const luma = (r: number, g: number, b: number) => 0.299 * r + 0.587 * g + 0.114 * b;

function isSkin(r: number, g: number, b: number, y: number): boolean {
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  return y > 55 && cr >= 134 && cr <= 182 && cb >= 80 && cb <= 132;
}

/** Otsu threshold on a 0–255 histogram. */
function otsu(hist: number[], total: number): number {
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * (hist[i] ?? 0);
  let sumB = 0;
  let wB = 0;
  let best = 0;
  let threshold = 100;
  for (let t = 0; t < 256; t++) {
    wB += hist[t] ?? 0;
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * (hist[t] ?? 0);
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) ** 2;
    if (between > best) {
      best = between;
      threshold = t;
    }
  }
  return threshold;
}

export function analysePixels({ data, width: w, height: h }: PixelImage): PixelAnalysis {
  const n = w * h;
  const y = new Float32Array(n);
  let mean = 0;
  let blown = 0;
  for (let i = 0; i < n; i++) {
    const v = luma(data[i * 4] ?? 0, data[i * 4 + 1] ?? 0, data[i * 4 + 2] ?? 0);
    y[i] = v;
    mean += v;
    if (v >= 250) blown++;
  }
  mean /= n || 1;
  const glare = blown / (n || 1);

  // Variance of the 4-neighbour Laplacian.
  let lapSum = 0;
  let lapSq = 0;
  let lapN = 0;
  for (let row = 1; row < h - 1; row++) {
    for (let col = 1; col < w - 1; col++) {
      const i = row * w + col;
      const l = (y[i - 1] ?? 0) + (y[i + 1] ?? 0) + (y[i - w] ?? 0) + (y[i + w] ?? 0) - 4 * (y[i] ?? 0);
      lapSum += l;
      lapSq += l * l;
      lapN++;
    }
  }
  const blur = lapN ? lapSq / lapN - (lapSum / lapN) ** 2 : 0;
  const quality = { blur: Math.round(blur), brightness: Math.round(mean), glare: Math.round(glare * 1000) / 1000 };

  let issue: ZoneIssue | null = null;
  if (mean < DARK_MAX) issue = 'too_dark';
  else if (mean > BRIGHT_MIN) issue = 'too_bright';
  else if (glare > GLARE_MAX) issue = 'glare';
  else if (blur < BLUR_MIN) issue = 'blurry';
  if (issue) return { ok: false, issue, cover: null, shine: null, quality };

  // Centre 60 % of the frame: where the guide asks the customer to aim.
  const x0 = Math.floor(w * 0.2);
  const x1 = Math.ceil(w * 0.8);
  const y0 = Math.floor(h * 0.2);
  const y1 = Math.ceil(h * 0.8);
  const hist = new Array<number>(256).fill(0);
  let roi = 0;
  for (let row = y0; row < y1; row++)
    for (let col = x0; col < x1; col++) {
      const bin = Math.min(255, Math.max(0, Math.round(y[row * w + col] ?? 0)));
      hist[bin] = (hist[bin] ?? 0) + 1;
      roi++;
    }
  const dark = Math.min(140, Math.max(50, otsu(hist, roi)));

  let hair = 0;
  let scalp = 0;
  let shiny = 0;
  for (let row = y0; row < y1; row++)
    for (let col = x0; col < x1; col++) {
      const i = row * w + col;
      const v = y[i] ?? 0;
      const r = data[i * 4] ?? 0;
      const g = data[i * 4 + 1] ?? 0;
      const b = data[i * 4 + 2] ?? 0;
      if (isSkin(r, g, b, v)) {
        scalp++;
        if (v >= SHINE_LUMA) shiny++;
      } else if (v < dark) hair++;
    }

  const subject = (hair + scalp) / (roi || 1);
  if (subject < MIN_SUBJECT) return { ok: false, issue: 'not_scalp', cover: null, shine: null, quality };
  const cover = hair / (hair + scalp);
  const shine = scalp ? shiny / scalp : 0;
  return {
    ok: true,
    issue: null,
    cover: Math.round(cover * 1000) / 1000,
    shine: Math.round(shine * 1000) / 1000,
    quality,
  };
}

/** Browser helper: downscale a photo blob and analyse it. */
export async function analysePhoto(blob: Blob, maxEdge = 256): Promise<PixelAnalysis> {
  const bitmap = await createImageBitmap(blob);
  try {
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('no_canvas');
    ctx.drawImage(bitmap, 0, 0, width, height);
    return analysePixels({ data: ctx.getImageData(0, 0, width, height).data, width, height });
  } finally {
    bitmap.close();
  }
}

/** Plain-words retake hint for a quality issue. */
export const ISSUE_HINT: Record<ZoneIssue, string> = {
  blurry: 'This photo is blurry. Hold the phone still and try again.',
  too_dark: 'This photo is too dark. Turn on a light or move near a window.',
  too_bright: 'This photo is too bright. Move away from direct light.',
  glare: 'There is strong glare. Tilt the phone a little or turn off the flash.',
  not_scalp: 'We could not see your scalp clearly. Fill the frame with this area and try again.',
};
