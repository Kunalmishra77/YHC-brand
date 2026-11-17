import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { getLegalDocument, LEGAL_SLUGS, type LegalContext } from './legal';
import type { ContentBlock } from './types';

const base: LegalContext = {
  consultations: false,
  onlineShop: false,
  consultFee: '₹500',
  freeRescheduleHours: 24,
  creditLine: null,
  doctorName: 'Dr. Tyagi',
  supportEmail: 'care@example.com',
  grievanceName: 'Grievance Officer',
  grievanceEmail: 'grievance@example.com',
  guarantee: null,
};

function text(blocks: ContentBlock[]): string {
  return blocks
    .map((b) => {
      if ('text' in b && typeof b.text === 'string') return b.text;
      if ('items' in b && Array.isArray(b.items)) return b.items.join(' ');
      return '';
    })
    .join(' ');
}

describe('legal pages follow the live journey (ADR-36/38)', () => {
  it('describe no consultation, video call, Razorpay or checkout while those are switched off', () => {
    for (const slug of LEGAL_SLUGS) {
      const body = text(getLegalDocument(slug, base).blocks);
      expect(body, slug).not.toMatch(/consultation fee|video call|video consultation|Razorpay|telemedicine|at checkout|reschedule/i);
    }
  });

  it('tell customers the hair-care team may see a scan they agreed to share (ADR-37)', () => {
    const body = text(getLegalDocument('privacy', base).blocks);
    expect(body).toMatch(/if you agree on the scan page/i);
    expect(body).not.toMatch(/cannot see your clinical information/i);
  });

  it('bring back the consultation wording when consultations are switched on', () => {
    const on = { ...base, consultations: true, onlineShop: true };
    expect(text(getLegalDocument('refund-cancellation', on).blocks)).toMatch(/consultation fee \(currently ₹500\)/);
    expect(text(getLegalDocument('medical-disclaimer', on).blocks)).toMatch(/Telemedicine Practice Guidelines/);
    expect(text(getLegalDocument('shipping', on).blocks)).toMatch(/at checkout/);
  });
});
