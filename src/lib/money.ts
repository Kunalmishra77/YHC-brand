/** Money is always integer paise. Format only at the edge. */
export type Paise = number;

export function paise(value: number): Paise {
  if (!Number.isInteger(value)) throw new RangeError(`paise must be an integer, got ${value}`);
  return value;
}

export function rupeesToPaise(rupees: number): Paise {
  return Math.round(rupees * 100);
}

const wholeFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const fractionFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** `formatINR(1499900)` → `₹14,999`; keeps paise only when present (`₹10.50`). */
export function formatINR(amount: Paise): string {
  const formatter = amount % 100 === 0 ? wholeFormatter : fractionFormatter;
  return formatter.format(amount / 100);
}
