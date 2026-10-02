import { describe, expect, it } from 'vitest';
import { AppError, toErrorBody } from './errors';
import { err, ok } from './result';

describe('errors', () => {
  it('maps AppError to its code and status', () => {
    expect(toErrorBody(new AppError('slot_taken', 'That slot was just booked.', 409))).toEqual({
      error: { code: 'slot_taken', message: 'That slot was just booked.' },
      status: 409,
    });
  });

  it('hides details of unknown errors', () => {
    const body = toErrorBody(new Error('db password is hunter2'));
    expect(body.status).toBe(500);
    expect(body.error.message).not.toContain('hunter2');
  });

  it('builds results', () => {
    expect(ok(1)).toEqual({ ok: true, data: 1 });
    expect(err('x', 'y')).toEqual({ ok: false, error: { code: 'x', message: 'y' } });
  });
});
