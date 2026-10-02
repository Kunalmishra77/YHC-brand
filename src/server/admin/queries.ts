import 'server-only';

import type { Appointment, Customer, Order, OrderStatus } from '@/lib/domain/types';
import { PLANS, PRODUCTS } from '@/server/demo/fixtures';
import { db } from '@/server/demo/store';
import { adminState } from './state';

/* Read models for admin pages. No clinical fields leave this module (CLAUDE.md, clinical data). */

export const ORDER_TABS = [
  { key: 'to_pack', label: 'To pack', statuses: ['paid'] },
  { key: 'processing', label: 'Processing', statuses: ['processing'] },
  { key: 'shipped', label: 'Shipped', statuses: ['shipped'] },
  { key: 'delivered', label: 'Delivered', statuses: ['delivered'] },
  { key: 'exceptions', label: 'Exceptions', statuses: ['rto', 'cancelled'] },
  { key: 'all', label: 'All', statuses: null },
] as const satisfies readonly { key: string; label: string; statuses: readonly OrderStatus[] | null }[];

export type OrderTabKey = (typeof ORDER_TABS)[number]['key'];

export function parseOrderTab(value: unknown): OrderTabKey {
  const v = String(Array.isArray(value) ? value[0] : (value ?? ''));
  return ORDER_TABS.find((t) => t.key === v)?.key ?? 'to_pack';
}

export const customerById = (id: string): Customer | undefined => db().customers.find((c) => c.id === id);

export interface OrderRow {
  order: Order;
  customer: Customer | undefined;
}

export function listOrders(
  tab: OrderTabKey,
  q: string,
): { rows: OrderRow[]; counts: Record<OrderTabKey, number> } {
  const all = [...db().orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const matches = (statuses: readonly OrderStatus[] | null, o: Order) =>
    statuses === null || statuses.includes(o.status);
  const counts = Object.fromEntries(
    ORDER_TABS.map((t) => [t.key, all.filter((o) => matches(t.statuses, o)).length]),
  ) as Record<OrderTabKey, number>;
  const tabDef = ORDER_TABS.find((t) => t.key === tab) ?? ORDER_TABS[0];
  const needle = q.trim().toLowerCase();
  const rows = all
    .filter((o) => matches(tabDef.statuses, o))
    .map((order) => ({ order, customer: customerById(order.customerId) }))
    .filter(({ order, customer }) => {
      if (!needle) return true;
      return [order.code, order.awb ?? '', order.paymentId ?? '', customer?.name ?? '', customer?.phone ?? '']
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  return { rows, counts };
}

export interface PickLine {
  productId: string;
  name: string;
  units: number;
  orders: string[];
}

/**
 * Pick list by product for paid (to-pack) orders (FR-M9-4). Plan orders expand to the
 * recommendation's products (or the full protocol when none is linked), one unit per
 * `daysOfSupply` across the plan months; shop lines map by product name.
 */
export function pickList(): PickLine[] {
  const s = db();
  const lines = new Map<string, PickLine>();
  const add = (productId: string, units: number, code: string) => {
    const p = PRODUCTS.find((x) => x.id === productId);
    if (!p) return;
    const line = lines.get(productId) ?? { productId, name: p.name, units: 0, orders: [] };
    line.units += units;
    if (!line.orders.includes(code)) line.orders.push(code);
    lines.set(productId, line);
  };
  for (const o of s.orders.filter((x) => x.status === 'paid')) {
    const plan = PLANS.find((p) => p.id === o.planId);
    if (plan) {
      const rec = s.recommendations.find((r) => r.id === o.recommendationId);
      const ids = rec?.productIds.length
        ? rec.productIds
        : PRODUCTS.filter((p) => p.requiresConsultation).map((p) => p.id);
      for (const id of ids) {
        const p = PRODUCTS.find((x) => x.id === id);
        if (p) add(id, Math.max(1, Math.ceil((plan.months * 30) / Math.max(1, p.daysOfSupply))), o.code);
      }
    } else {
      for (const l of o.lines) {
        const p = PRODUCTS.find((x) => x.name === l.label);
        if (p) add(p.id, l.qty, o.code);
      }
    }
  }
  return [...lines.values()].sort((a, b) => b.units - a.units);
}

export interface TimelineItem {
  at: string;
  kind: 'order' | 'appointment' | 'message' | 'refund';
  title: string;
  detail: string;
  status?: { label: string; tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'pending' };
  href?: string;
}

/** Non-clinical customer timeline: orders, appointment logistics, message metadata, refunds. */
export function customerTimeline(customerId: string): TimelineItem[] {
  const s = db();
  const items: TimelineItem[] = [];
  for (const o of s.orders.filter((x) => x.customerId === customerId)) {
    items.push({
      at: o.paidAt ?? o.createdAt,
      kind: 'order',
      title: `Order ${o.code}`,
      detail: o.lines.map((l) => l.label).join(', '),
      href: `/admin/orders/${o.code}`,
    });
  }
  for (const a of s.appointments.filter((x) => x.customerId === customerId)) {
    items.push({
      at: a.startsAt,
      kind: 'appointment',
      title: `Consultation ${a.code}`,
      detail: a.kind === 'follow_up' ? 'Follow-up consultation' : 'First consultation',
    });
  }
  for (const m of s.messages.filter((x) => x.customerId === customerId)) {
    items.push({
      at: m.at,
      kind: 'message',
      title:
        m.direction === 'inbound'
          ? `Inbound ${m.channel} reply`
          : `${m.channel === 'whatsapp' ? 'WhatsApp' : m.channel.toUpperCase()} · ${m.template ?? 'message'}`,
      // Inbound replies can carry health details — never shown outside the care team.
      detail: m.direction === 'inbound' ? 'Content visible to the care team only' : m.category,
    });
  }
  const codes = new Set([
    ...s.orders.filter((o) => o.customerId === customerId).map((o) => o.code),
    ...s.appointments.filter((a) => a.customerId === customerId).map((a) => a.code),
  ]);
  for (const r of adminState().refunds.filter((x) => codes.has(x.target))) {
    items.push({
      at: r.at,
      kind: 'refund',
      title: `Refund recorded · ${r.target}`,
      detail: `${r.full ? 'Full' : 'Partial'} · ${r.reason}`,
    });
  }
  return items.sort((a, b) => b.at.localeCompare(a.at));
}

/** Appointment fields safe for admin (no intake, notes or prescriptions). */
export type AdminAppointment = Pick<
  Appointment,
  'id' | 'code' | 'customerId' | 'kind' | 'status' | 'startsAt' | 'endsAt' | 'feePaise' | 'paymentId'
>;

export function listAppointments(): AdminAppointment[] {
  return [...db().appointments]
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .map(({ id, code, customerId, kind, status, startsAt, endsAt, feePaise, paymentId }) => ({
      id,
      code,
      customerId,
      kind,
      status,
      startsAt,
      endsAt,
      feePaise,
      paymentId,
    }));
}
