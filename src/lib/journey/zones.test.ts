import { describe, expect, it } from 'vitest';
import { submitScanSchema } from '@/lib/validation/journey';
import { CAPTURE_ZONES, type CaptureZone } from './types';
import { isRequiredZone, nextZoneToFix, orderZones, zoneSelectionIssue } from './zones';

const answers = { duration: '1_3y', pattern: 'crown', longBald: 'no', familyHistory: 'no' } as const;
const four: CaptureZone[] = ['forehead_centre', 'top', 'crown', 'parting'];

describe('capture zone rules', () => {
  it('requires the front hairline and the crown', () => {
    expect(isRequiredZone('forehead_centre')).toBe(true);
    expect(isRequiredZone('crown')).toBe(true);
    expect(isRequiredZone('back')).toBe(false);
  });

  it('accepts four zones including the required ones', () => {
    expect(zoneSelectionIssue(four, ['forehead_left', 'forehead_right', 'back'])).toBeNull();
    expect(zoneSelectionIssue([...CAPTURE_ZONES])).toBeNull();
  });

  it('rejects a missing required zone even with enough zones', () => {
    expect(zoneSelectionIssue(['forehead_left', 'forehead_right', 'top', 'crown', 'back'])).toEqual({
      code: 'required_missing',
      zones: ['forehead_centre'],
    });
  });

  it('rejects fewer than four zones', () => {
    expect(zoneSelectionIssue(['forehead_centre', 'crown', 'top'])).toEqual({ code: 'too_few', missing: 1 });
  });

  it('rejects duplicates and zones both captured and skipped', () => {
    expect(zoneSelectionIssue(['crown', 'crown', 'top', 'forehead_centre'])).toEqual({ code: 'duplicate' });
    expect(zoneSelectionIssue(four, ['top'])).toEqual({ code: 'overlap', zones: ['top'] });
  });

  it('orders zones and points to the zone to fix', () => {
    expect(orderZones(['back', 'crown', 'forehead_left'])).toEqual(['forehead_left', 'crown', 'back']);
    expect(nextZoneToFix(['forehead_left', 'top', 'parting', 'back'])).toBe('forehead_centre');
    expect(nextZoneToFix(['forehead_centre', 'crown', 'top'], ['forehead_left'])).toBe('forehead_left');
    expect(nextZoneToFix(four)).toBeNull();
  });
});

describe('submitScanSchema', () => {
  it('parses a valid submission and defaults skipped zones', () => {
    const r = submitScanSchema.parse({ answers, capturedZones: four });
    expect(r.skippedZones).toEqual([]);
  });

  it('refuses a scan without the crown', () => {
    const r = submitScanSchema.safeParse({
      answers,
      capturedZones: ['forehead_left', 'forehead_centre', 'top', 'parting', 'back'],
      skippedZones: ['crown'],
    });
    expect(r.success).toBe(false);
  });

  it('refuses unknown zones', () => {
    const r = submitScanSchema.safeParse({ answers, capturedZones: [...four, 'closeup'] });
    expect(r.success).toBe(false);
  });
});
