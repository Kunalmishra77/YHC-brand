'use client';

import { z } from 'zod';

// Our CSP has no 'unsafe-eval'. zod 4 probes `new Function()` for a faster parser, which the browser
// blocks and reports as a CSP issue on every page; jitless skips the probe (same results, no eval).
z.config({ jitless: true });

export function ZodConfig() {
  return null;
}
