import 'server-only';

import type { Setting } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';

/* Settings validation (FR-M12-9): the type is inferred from the seeded value; known keys get ranges. */

export type SettingKind = 'boolean' | 'number' | 'json' | 'text';

export function settingKind(s: Pick<Setting, 'value'>): SettingKind {
  const v = s.value.trim();
  if (v === 'true' || v === 'false') return 'boolean';
  if (v !== '' && Number.isFinite(Number(v))) return 'number';
  if (v.startsWith('{') || v.startsWith('[')) return 'json';
  return 'text';
}

const RANGES: Record<string, [number, number]> = {
  'consult.fee_paise': [0, 1_000_000],
  'consult.hold_minutes': [3, 60],
  'consult.slot_minutes': [10, 120],
  'consult.buffer_minutes': [0, 60],
  'consult.booking_window_days': [1, 60],
  'consult.min_notice_minutes': [0, 1440],
  'consult.max_per_day': [1, 40],
  'consult.credit_window_days': [0, 60],
  'consult.free_reschedule_hours': [0, 72],
  'recommendation.link_ttl_hours': [1, 720],
  'recommendation.nudge_after_hours': [1, 168],
  'sales.first_contact_sla_minutes': [1, 1440],
};

/** Returns the normalised value or throws AppError('invalid_setting'). */
export function validateSettingValue(key: string, kind: SettingKind, raw: string): string {
  const value = raw.trim();
  const fail = (msg: string): never => {
    throw new AppError('invalid_setting', `${key}: ${msg}`, 422);
  };
  switch (kind) {
    case 'boolean':
      if (value !== 'true' && value !== 'false') fail('must be on or off.');
      return value;
    case 'number': {
      const n = Number(value);
      if (value === '' || !Number.isFinite(n)) fail('must be a number.');
      if (!Number.isInteger(n)) fail('must be a whole number.');
      const range = RANGES[key];
      if (range && (n < range[0] || n > range[1])) fail(`must be between ${range[0]} and ${range[1]}.`);
      if (key.endsWith('_paise') && n < 0) fail('cannot be negative.');
      return String(n);
    }
    case 'json': {
      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch {
        return fail('is not valid JSON.');
      }
      if (key === 'messaging.quiet_hours') {
        const ok =
          parsed !== null &&
          typeof parsed === 'object' &&
          !Array.isArray(parsed) &&
          'start' in parsed &&
          'end' in parsed &&
          /^([01]\d|2[0-3]):[0-5]\d$/.test(String(parsed.start)) &&
          /^([01]\d|2[0-3]):[0-5]\d$/.test(String(parsed.end));
        if (!ok) fail('use {"start":"HH:MM","end":"HH:MM"}.');
      }
      if (key === 'refill.reminder_days_before') {
        const ok =
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every((d) => Number.isInteger(d) && d >= 0 && d <= 30);
        if (!ok) fail('use a list of whole days, e.g. [7, 4, 1].');
      }
      // Match the seeded formatting: `[7, 4, 1]`, `{"start":"21:00","end":"09:00"}`.
      return Array.isArray(parsed)
        ? `[${parsed.map((x) => JSON.stringify(x)).join(', ')}]`
        : JSON.stringify(parsed);
    }
    default:
      if (value.length === 0) fail('cannot be empty.');
      return value;
  }
}
