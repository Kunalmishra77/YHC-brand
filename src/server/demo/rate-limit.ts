import 'server-only';

/*
 * DEMO ONLY: fixed-window, in-memory rate limit (per server instance). Good enough to slow down
 * guessing the demo access code; production uses Upstash Ratelimit (docs/02 §2) in kit Phase 01.
 */
const windows = new Map<string, { count: number; resetAt: number }>();

/** True while `key` has made fewer than `limit` calls in the current window. */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  const w = windows.get(key);
  if (!w || now >= w.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  w.count += 1;
  return w.count <= limit;
}
