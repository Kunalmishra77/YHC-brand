import { describe, expect, it } from 'vitest';
import { photoPath } from './scans';

// Bug 2026-11-05: photos were Supabase signed URLs (*.supabase.co), which several Indian ISPs block,
// so customers saw broken images. Photos must always come from our own domain.
describe('photoPath', () => {
  it('is a same-origin path, never a Supabase URL', () => {
    const url = photoPath('0b6f5c2e-1111-4a4a-8888-123456789abc', 'crown');
    expect(url).toBe('/api/scan/photo/0b6f5c2e-1111-4a4a-8888-123456789abc/crown');
    expect(url).not.toMatch(/supabase/);
  });
});
