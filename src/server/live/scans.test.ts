import { describe, expect, it } from 'vitest';
import { TEAM_PHOTO_CONSENT_VERSION, photoPath, teamMaySee } from './scans';

// Bug 2026-11-05: photos were Supabase signed URLs (*.supabase.co), which several Indian ISPs block,
// so customers saw broken images. Photos must always come from our own domain.
describe('photoPath', () => {
  it('is a same-origin path, never a Supabase URL', () => {
    const url = photoPath('0b6f5c2e-1111-4a4a-8888-123456789abc', 'crown');
    expect(url).toBe('/api/scan/photo/0b6f5c2e-1111-4a4a-8888-123456789abc/crown');
    expect(url).not.toMatch(/supabase/);
  });
});

describe('teamMaySee (ADR-37)', () => {
  const team = (created_at: string, granted = true) => ({ version: TEAM_PHOTO_CONSENT_VERSION, granted, created_at });
  it('allows a scan finished after the team consent', () => {
    expect(teamMaySee([team('2026-11-06T10:00:00Z')], '2026-11-06T10:05:00Z')).toBe(true);
  });
  it('keeps older scans private', () => {
    expect(teamMaySee([team('2026-11-06T10:00:00Z')], '2026-11-05T10:00:00Z')).toBe(false);
    expect(teamMaySee([{ version: '2026-11-05', granted: true, created_at: '2026-11-05T09:00:00Z' }], '2026-11-05T10:00:00Z')).toBe(false);
  });
  it('ignores a consent that was not granted', () => {
    expect(teamMaySee([team('2026-11-06T10:00:00Z', false)], '2026-11-06T11:00:00Z')).toBe(false);
  });
});
