import 'server-only';

import type { Paise } from '@/lib/money';

export interface CreditInput {
  amountPaise: Paise;
  expiresAt: string;
  usedOrderId: string | null;
}

export interface PlanPrice {
  subtotalPaise: Paise;
  creditPaise: Paise;
  totalPaise: Paise;
}

/** TRD §6.4: plan price minus the oldest unused, unexpired consult credit (if enabled). */
export function pricePlan(input: {
  planPricePaise: Paise;
  credits: CreditInput[];
  creditEnabled: boolean;
  now: Date;
  shippingPaise?: Paise;
}): PlanPrice {
  const subtotal = input.planPricePaise;
  const usable = input.creditEnabled
    ? input.credits
        .filter((c) => c.usedOrderId === null && new Date(c.expiresAt) > input.now)
        .sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))[0]
    : undefined;
  const credit = usable ? Math.min(usable.amountPaise, subtotal) : 0;
  return {
    subtotalPaise: subtotal,
    creditPaise: credit,
    totalPaise: subtotal - credit + (input.shippingPaise ?? 0),
  };
}
