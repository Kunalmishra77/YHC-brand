import { formatInTimeZone } from 'date-fns-tz';
import { describe, expect, it } from 'vitest';
import { IST } from '@/lib/time';
import { followUpState, quickFollowUps, retryAt, whatsappLink, whatsappText } from './playbook';

const ist = (d: Date) => formatInTimeZone(d, IST, 'yyyy-MM-dd HH:mm');
const at = (s: string) => new Date(`${s}+05:30`);

describe('retryAt', () => {
  it('tries again 3 hours later inside working hours', () => {
    expect(ist(retryAt(at('2026-11-06T11:00:00')))).toBe('2026-11-06 14:00');
  });
  it('moves an evening miss to 11 am the next day', () => {
    expect(ist(retryAt(at('2026-11-06T17:30:00')))).toBe('2026-11-07 11:00');
    expect(ist(retryAt(at('2026-11-06T23:10:00')))).toBe('2026-11-07 11:00');
  });
  it('moves an early-morning miss to 11 am the same day', () => {
    expect(ist(retryAt(at('2026-11-06T01:00:00')))).toBe('2026-11-06 11:00');
  });
});

describe('quickFollowUps', () => {
  it('gives IST wall-clock times', () => {
    const q = quickFollowUps(at('2026-11-06T22:00:00'));
    expect(ist(q.find((x) => x.id === 'tomorrow11')?.at ?? new Date(0))).toBe('2026-11-07 11:00');
    expect(ist(q.find((x) => x.id === 'in3d')?.at ?? new Date(0))).toBe('2026-11-09 11:00');
  });
});

describe('followUpState', () => {
  const now = at('2026-11-06T12:00:00');
  it('marks past, today and later', () => {
    expect(followUpState(null, now)).toBeNull();
    expect(followUpState(at('2026-11-06T10:00:00').toISOString(), now)).toBe('overdue');
    expect(followUpState(at('2026-11-06T23:00:00').toISOString(), now)).toBe('today');
    expect(followUpState(at('2026-11-07T00:30:00').toISOString(), now)).toBe('later');
  });
});

describe('whatsapp', () => {
  it('fills the first name and member, without clinical words', () => {
    const t = whatsappText('intro', { name: 'Ravi Kumar', member: 'Neha' });
    expect(t).toContain('Hi Ravi,');
    expect(t).toContain('Neha from Your Hair Company');
    expect(t).not.toMatch(/eligible|bald|thinning|crown/i);
  });
  it('falls back to the team name', () => {
    expect(whatsappText('missed_call', { name: '', member: null })).toContain('Hi there, this is the Your Hair Company team');
  });
  it('builds a wa.me link with the text encoded', () => {
    expect(whatsappLink('+91 98765 43210', 'Hi & bye')).toBe('https://wa.me/919876543210?text=Hi%20%26%20bye');
  });
});
