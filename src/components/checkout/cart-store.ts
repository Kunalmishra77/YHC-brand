'use client';

import { useSyncExternalStore } from 'react';
import { MAX_QTY, cartItemSchema, type CartItem } from '@/lib/validation/checkout';

/*
 * Client cart persisted per device (FR-M2-4). Holds only product ids + quantities — never prices;
 * the server prices everything at checkout. Storage can be unavailable (private mode) → in-memory.
 */

const KEY = 'yhc.cart.v1';
const EVENT = 'yhc:cart';
let memory: CartItem[] = [];
let cachedRaw: string | null | undefined;
let cachedItems: CartItem[] = [];

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): CartItem[] {
  if (!raw) return memory;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.flatMap((x) => {
      const r = cartItemSchema.safeParse(x);
      return r.success ? [r.data] : [];
    });
  } catch {
    return [];
  }
}

function snapshot(): CartItem[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parse(raw);
  }
  return raw === null ? memory : cachedItems;
}

function write(items: CartItem[]) {
  memory = items;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage unavailable — keep in memory for this tab */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(EVENT, cb);
  };
}

const SERVER: CartItem[] | null = null;

/** `null` while rendering on the server / before hydration → show a skeleton, not an empty cart. */
export function useCart(): CartItem[] | null {
  return useSyncExternalStore(subscribe, snapshot, () => SERVER);
}

export const cart = {
  add(productId: string, qty = 1) {
    const items = snapshot();
    const found = items.find((i) => i.productId === productId);
    write(
      found
        ? items.map((i) => (i.productId === productId ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i))
        : [...items, { productId, qty: Math.min(MAX_QTY, qty) }],
    );
  },
  setQty(productId: string, qty: number) {
    write(
      snapshot()
        .map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : i))
        .filter((i) => i.qty > 0),
    );
  },
  remove(productId: string) {
    write(snapshot().filter((i) => i.productId !== productId));
  },
  clear() {
    write([]);
  },
};
