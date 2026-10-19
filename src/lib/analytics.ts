/*
 * Funnel measurement (audit BIZ-01). GA4 and Meta Pixel load only after the visitor accepts analytics
 * cookies, and only when their IDs are configured (NEXT_PUBLIC_GA4_ID, NEXT_PUBLIC_META_PIXEL_ID).
 * Events carry NO health information — never concern, scan, answers or products — only the funnel
 * step and, for payments, the amount (CLAUDE.md: clinical data never leaves the clinical record).
 */

export type FunnelEvent = 'details_submitted' | 'scan_started' | 'scan_completed' | 'consult_paid' | 'plan_paid';

export const ANALYTICS_CONSENT_KEY = 'yhc_analytics_consent';
export type AnalyticsConsent = 'granted' | 'denied';

export const ANALYTICS_IDS = {
  ga4: process.env.NEXT_PUBLIC_GA4_ID?.trim() || null,
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || null,
} as const;

export function analyticsConfigured(): boolean {
  return ANALYTICS_IDS.ga4 !== null || ANALYTICS_IDS.metaPixel !== null;
}

/** Meta standard events used for the ad funnel; the rest go as custom events. */
const META_EVENT: Partial<Record<FunnelEvent, string>> = {
  details_submitted: 'Lead',
  consult_paid: 'Purchase',
  plan_paid: 'Purchase',
};

interface TrackingWindow {
  gtag?: (...args: unknown[]) => void;
  fbq?: (...args: unknown[]) => void;
}

export function readConsent(): AnalyticsConsent | null {
  try {
    const v = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

/** Fire a funnel event. A no-op without consent or without loaded tags; never throws. */
export function track(event: FunnelEvent, params: { valuePaise?: number } = {}): void {
  if (typeof window === 'undefined' || readConsent() !== 'granted') return;
  const w = window as unknown as TrackingWindow;
  const value = params.valuePaise !== undefined ? Math.round(params.valuePaise) / 100 : undefined;
  const money = value !== undefined ? { value, currency: 'INR' } : {};
  try {
    w.gtag?.('event', event, money);
    const meta = META_EVENT[event];
    if (meta) w.fbq?.('track', meta, money);
    else w.fbq?.('trackCustom', event, money);
  } catch {
    // Measurement must never break the journey.
  }
}
