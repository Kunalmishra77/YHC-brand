import { describe, expect, it } from 'vitest';
import { ZodError } from 'zod';
import { resolveScanOverride } from './recommendation';

describe('resolveScanOverride (FUN-07)', () => {
  it('needs no reason when a scan is on file', () => {
    expect(resolveScanOverride(true, undefined)).toBeNull();
    expect(resolveScanOverride(true, 'ignored reason text')).toBeNull();
  });

  it('requires a reason of at least 10 characters when there is no scan', () => {
    expect(() => resolveScanOverride(false, undefined)).toThrow(ZodError);
    expect(() => resolveScanOverride(false, '  too short ')).toThrow(ZodError); // 9 chars after trim
    expect(resolveScanOverride(false, 'ten chars!')).toBe('ten chars!');
    expect(() => resolveScanOverride(false, 'short')).toThrow(ZodError);
    expect(() => resolveScanOverride(false, '         x')).toThrow(ZodError);
  });

  it('returns the trimmed reason', () => {
    expect(resolveScanOverride(false, '  Scan app failed; examined on video.  ')).toBe(
      'Scan app failed; examined on video.',
    );
  });
});
