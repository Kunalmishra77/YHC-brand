import { describe, expect, it } from 'vitest';
import { DEFAULT_SCAN_RULES, decideOutcome, parseScanRules, type ZoneAnalysis } from './rules';

const zone = (cover: number | null, shine = 0, ok = true): ZoneAnalysis => ({
  ok,
  issue: ok ? null : 'blurry',
  cover,
  shine,
});
const rules = DEFAULT_SCAN_RULES;

describe('decideOutcome', () => {
  it('eligible when hair is visible in the pattern zones', () => {
    const r = decideOutcome({
      age: 62,
      longBald: 'no',
      rules,
      zones: { forehead_centre: zone(0.55), crown: zone(0.4), back: zone(0.9) },
    });
    expect(r.outcome).toBe('eligible');
  });

  it('not eligible: bare, shiny pattern zones and older age (client rule)', () => {
    const r = decideOutcome({
      age: 60,
      longBald: 'no',
      rules,
      zones: { forehead_centre: zone(0.05, 0.3), top: zone(0.02, 0.4), crown: zone(0.04, 0.35), back: zone(0.8) },
    });
    expect(r.outcome).toBe('not_eligible');
    expect(r.reasons).toContain('no_hair_shiny_scalp');
  });

  it('bare and shiny but younger is left to the team (unclear), not refused', () => {
    const r = decideOutcome({
      age: 32,
      longBald: 'no',
      rules,
      zones: { forehead_centre: zone(0.05, 0.3), crown: zone(0.03, 0.4) },
    });
    expect(r).toEqual({ outcome: 'unclear', reasons: ['no_hair_younger'] });
  });

  it('bare but not shiny (fine stubble / roots) stays eligible', () => {
    const r = decideOutcome({
      age: 66,
      longBald: 'no',
      rules,
      zones: { forehead_centre: zone(0.08, 0.05), crown: zone(0.06, 0.02), back: zone(0.7) },
    });
    expect(r.outcome).toBe('eligible');
  });

  it('unclear when the photos could not be judged', () => {
    const r = decideOutcome({
      age: 40,
      longBald: 'no',
      rules,
      zones: { forehead_centre: zone(null, 0, false), crown: zone(null, 0, false), back: zone(0.8) },
    });
    expect(r).toEqual({ outcome: 'unclear', reasons: ['photos_unclear'] });
  });

  it('a long-bald answer tips an older person with one bare shiny zone', () => {
    const r = decideOutcome({
      age: 70,
      longBald: 'large',
      rules,
      zones: { forehead_centre: zone(0.5), top: zone(0.4), crown: zone(0.05, 0.3), back: zone(0.8) },
    });
    expect(r.outcome).toBe('not_eligible');
  });

  it('the age threshold comes from the rules', () => {
    const zones = { forehead_centre: zone(0.05, 0.3), crown: zone(0.03, 0.4) };
    expect(decideOutcome({ age: 50, longBald: 'no', zones, rules: { ...rules, olderAge: 45 } }).outcome).toBe(
      'not_eligible',
    );
  });
});

describe('parseScanRules', () => {
  it('reads the setting and falls back per field', () => {
    const r = parseScanRules({ older_age: 60, bald_cover_max: 9, pattern_zones: ['crown', 'nope'] });
    expect(r.olderAge).toBe(60);
    expect(r.baldCoverMax).toBe(DEFAULT_SCAN_RULES.baldCoverMax);
    expect(r.patternZones).toEqual(['crown']);
  });
  it('handles a missing setting', () => {
    expect(parseScanRules(null)).toEqual(DEFAULT_SCAN_RULES);
  });
});
