'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

/**
 * Hydration-safe "reduce motion" flag. motion's own hook reads the OS setting on the very first client
 * render, so with animations turned off in Windows/macOS the client HTML differed from the server's and
 * React threw error #418 and re-rendered the page (seen 2026-10-22). This returns false while hydrating
 * (matching the server), then the real value.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
