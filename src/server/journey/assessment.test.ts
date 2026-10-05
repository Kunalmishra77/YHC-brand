import { describe, expect, it } from 'vitest';
import type { ScanAnswers } from '@/lib/journey/types';
import { assessScan } from './assessment';

const base: ScanAnswers = { duration: '1_3y', pattern: 'crown', longBald: 'no', familyHistory: 'no' };

const BANNED = /cure|100%|guaranteed regrowth|permanent|miracle|no side effects/i;

describe('assessScan (simulated demo analysis)', () => {
  it('is deterministic for the same answers', () => {
    expect(assessScan(base)).toEqual(assessScan({ ...base }));
  });

  it('marks early, localised thinning without long bald areas as suitable', () => {
    const r = assessScan(base);
    expect(r.suitability).toBe('suitable');
    expect(r.metrics.rootDensity).toBe(68);
    expect(r.metrics.miniaturisation).toBe('low');
    expect(r.metrics.thinningAreas).toEqual(['crown']);
    expect(r.explanation).toContain('Individual results vary');
  });

  it('marks a large area bald for 5+ years with very low roots as not suitable', () => {
    const r = assessScan({ duration: 'gt_5y', pattern: 'crown', longBald: 'large', familyHistory: 'yes' });
    expect(r.suitability).toBe('not_suitable');
    expect(r.metrics.viableFollicles).toBeLessThan(30);
    expect(r.metrics.miniaturisation).toBe('high');
    expect(r.reasons.length).toBeGreaterThan(0);
  });

  it('asks for doctor review for mixed signals', () => {
    expect(assessScan({ ...base, longBald: 'small', duration: '3_5y' }).suitability).toBe('doctor_review');
    const patches = assessScan({ ...base, pattern: 'patches' });
    expect(patches.suitability).toBe('doctor_review');
    expect(patches.metrics.scalpHealth).toBe('needs_attention');
  });

  it('asks for doctor review when root density is low even without bald areas', () => {
    const r = assessScan({ duration: 'gt_5y', pattern: 'diffuse', longBald: 'no', familyHistory: 'yes' });
    expect(r.metrics.rootDensity).toBeLessThan(40);
    expect(r.suitability).toBe('doctor_review');
  });

  it('keeps metrics in range and never uses banned claims', () => {
    const durations = ['lt_1y', '1_3y', '3_5y', 'gt_5y'] as const;
    const patterns = ['hairline', 'crown', 'diffuse', 'parting', 'patches', 'not_sure'] as const;
    const bald = ['no', 'small', 'large'] as const;
    const family = ['yes', 'no', 'not_sure'] as const;
    for (const duration of durations)
      for (const pattern of patterns)
        for (const longBald of bald)
          for (const familyHistory of family) {
            const r = assessScan({ duration, pattern, longBald, familyHistory });
            expect(r.metrics.rootDensity).toBeGreaterThanOrEqual(0);
            expect(r.metrics.rootDensity).toBeLessThanOrEqual(100);
            expect(r.metrics.viableFollicles).toBeGreaterThanOrEqual(0);
            expect(r.metrics.viableFollicles).toBeLessThanOrEqual(100);
            expect(r.metrics.thinningAreas.length).toBeGreaterThan(0);
            const copy = [r.headline, r.explanation, ...r.reasons].join(' ');
            expect(copy).not.toMatch(BANNED);
          }
  });
});
