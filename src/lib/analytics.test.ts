import { afterEach, describe, expect, it, vi } from 'vitest';
import { ANALYTICS_CONSENT_KEY, track } from './analytics';

function fakeWindow(consent: string | null) {
  const gtag = vi.fn();
  const fbq = vi.fn();
  const store = new Map<string, string>(consent ? [[ANALYTICS_CONSENT_KEY, consent]] : []);
  vi.stubGlobal('window', {
    gtag,
    fbq,
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) },
  });
  return { gtag, fbq };
}

afterEach(() => vi.unstubAllGlobals());

describe('track (BIZ-01)', () => {
  it('does nothing without consent', () => {
    const { gtag, fbq } = fakeWindow(null);
    track('scan_started');
    expect(gtag).not.toHaveBeenCalled();
    expect(fbq).not.toHaveBeenCalled();
  });

  it('does nothing after the visitor declined', () => {
    const { gtag } = fakeWindow('denied');
    track('details_submitted');
    expect(gtag).not.toHaveBeenCalled();
  });

  it('sends the step, and amounts in rupees, once consent is granted', () => {
    const { gtag, fbq } = fakeWindow('granted');
    track('consult_paid', { valuePaise: 50000 });
    expect(gtag).toHaveBeenCalledWith('event', 'consult_paid', { value: 500, currency: 'INR' });
    expect(fbq).toHaveBeenCalledWith('track', 'Purchase', { value: 500, currency: 'INR' });
    track('scan_completed');
    expect(fbq).toHaveBeenCalledWith('trackCustom', 'scan_completed', {});
  });

  it('never throws when a tag misbehaves', () => {
    const { gtag } = fakeWindow('granted');
    gtag.mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => track('plan_paid', { valuePaise: 1499900 })).not.toThrow();
  });
});
