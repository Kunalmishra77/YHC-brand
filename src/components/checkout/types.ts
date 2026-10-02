/** Serialisable view models for cart, checkout and plan payment. */

export interface CatalogItemView {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  pricePaise: number;
  daysOfSupply: number;
}

export interface CartQuote {
  lines: { productId: string; name: string; qty: number; unitPaise: number; amountPaise: number }[];
  /** names of items dropped because they need a consultation or no longer exist */
  unavailable: string[];
  subtotalPaise: number;
  deliveryPaise: number;
  totalPaise: number;
}

export interface PlanOptionView {
  id: string;
  name: string;
  months: 1 | 2 | 3;
  pricePaise: number;
  compareAtPaise: number | null;
  isRecommended: boolean;
  /** server-computed via quotePlan() */
  quote: { subtotalPaise: number; creditPaise: number; totalPaise: number };
}

export interface CheckoutCustomerView {
  maskedPhone: string;
  name: string | null;
}
