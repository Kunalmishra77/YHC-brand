'use client';

import { Loader2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatINR } from '@/lib/money';
import { DemoResetNote, useAction, type ClientActionResult } from './action-kit';

const toRupees = (paise: number | null) => (paise === null ? '' : String(paise / 100));
const parseRupees = (v: string): number | null | 'invalid' => {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && Math.abs(Math.round(n * 100) - n * 100) < 1e-6 ? n : 'invalid';
};

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint ? <p className="text-[12px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function PriceConfirm({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-2 rounded-md bg-warning-bg p-3 text-sm text-warning">
      <p className="font-medium">Confirm price change</p>
      <ul className="list-disc pl-5">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <p>Customers see the new price immediately on the site and at checkout. The change is audited.</p>
    </div>
  );
}

export interface ProductFormValues {
  id: string;
  name: string;
  pricePaise: number | null;
  requiresConsultation: boolean;
  hsn: string;
  gstRate: number;
  daysOfSupply: number;
}

export function ProductEditDialog({
  product,
  action,
}: {
  product: ProductFormValues;
  action: (input: {
    priceRupees: number | null;
    requiresConsultation: boolean;
    hsn: string;
    gstRate: 0 | 5 | 12 | 18 | 28;
    daysOfSupply: number;
  }) => Promise<ClientActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(toRupees(product.pricePaise));
  const [rx, setRx] = useState(product.requiresConsultation);
  const [hsn, setHsn] = useState(product.hsn);
  const [gst, setGst] = useState(String(product.gstRate));
  const [days, setDays] = useState(String(product.daysOfSupply));
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction();

  const parsedPrice = parseRupees(price);
  const newPaise = parsedPrice === 'invalid' || parsedPrice === null ? null : Math.round(parsedPrice * 100);
  const priceChanged = parsedPrice !== 'invalid' && newPaise !== product.pricePaise;

  function validate(): string | null {
    if (parsedPrice === 'invalid') return 'Enter a price in rupees (up to 2 decimals).';
    if (!rx && parsedPrice === null) return 'Products sold without a consultation need a price.';
    if (!/^\d{4,8}$/.test(hsn.trim())) return 'HSN is 4–8 digits.';
    if (!['0', '5', '12', '18', '28'].includes(gst)) return 'GST must be 0, 5, 12, 18 or 28%.';
    const d = Number(days);
    if (!Number.isInteger(d) || d < 1 || d > 365) return 'Days of supply must be 1–365.';
    return null;
  }

  function save() {
    const v = validate();
    setError(v);
    if (v) return;
    if (priceChanged && !confirming) {
      setConfirming(true);
      return;
    }
    run(
      () =>
        action({
          priceRupees: parsedPrice === 'invalid' ? null : parsedPrice,
          requiresConsultation: rx,
          hsn: hsn.trim(),
          gstRate: Number(gst) as 0 | 5 | 12 | 18 | 28,
          daysOfSupply: Number(days),
        }),
      () => {
        setOpen(false);
        setConfirming(false);
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setConfirming(false);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="min-h-9" aria-label={`Edit ${product.name}`}>
          <Pencil className="size-4" aria-hidden />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {product.name}</DialogTitle>
          <DialogDescription asChild>
            <div>
              <DemoResetNote />
            </div>
          </DialogDescription>
        </DialogHeader>
        {confirming ? (
          <PriceConfirm
            lines={[
              `${product.name}: ${product.pricePaise === null ? 'no price' : formatINR(product.pricePaise)} → ${newPaise === null ? 'no price' : formatINR(newPaise)}`,
            ]}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="pe-price"
              label="Price (₹, incl. GST)"
              hint="Leave empty for consultation-only products."
            >
              <Input
                id="pe-price"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
            <Field id="pe-days" label="Days of supply">
              <Input
                id="pe-days"
                inputMode="numeric"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </Field>
            <Field id="pe-hsn" label="HSN code">
              <Input id="pe-hsn" inputMode="numeric" value={hsn} onChange={(e) => setHsn(e.target.value)} />
            </Field>
            <Field id="pe-gst" label="GST rate (%)">
              <Input id="pe-gst" inputMode="numeric" value={gst} onChange={(e) => setGst(e.target.value)} />
            </Field>
            <div className="flex items-center justify-between gap-3 rounded-md border border-line p-3 sm:col-span-2">
              <Label htmlFor="pe-rx" className="flex-1">
                Requires consultation
                <span className="block text-[12px] font-normal text-muted-foreground">
                  Prescription products are only sold through a doctor’s plan.
                </span>
              </Label>
              <Switch id="pe-rx" checked={rx} onCheckedChange={setRx} />
            </div>
          </div>
        )}
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => (confirming ? setConfirming(false) : setOpen(false))}
            disabled={pending}
          >
            {confirming ? 'Back' : 'Cancel'}
          </Button>
          <Button onClick={save} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {confirming ? 'Confirm price change' : priceChanged ? 'Review change' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export interface PlanFormValues {
  id: string;
  name: string;
  pricePaise: number;
  compareAtPaise: number | null;
  isRecommended: boolean;
}

export function PlanEditDialog({
  plan,
  action,
}: {
  plan: PlanFormValues;
  action: (input: {
    priceRupees: number;
    compareAtRupees: number | null;
    isRecommended: boolean;
  }) => Promise<ClientActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(toRupees(plan.pricePaise));
  const [compare, setCompare] = useState(toRupees(plan.compareAtPaise));
  const [recommended, setRecommended] = useState(plan.isRecommended);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { pending, run } = useAction();

  const p = parseRupees(price);
  const c = parseRupees(compare);
  const pPaise = typeof p === 'number' ? Math.round(p * 100) : null;
  const cPaise = typeof c === 'number' ? Math.round(c * 100) : null;
  const changed = pPaise !== plan.pricePaise || cPaise !== plan.compareAtPaise;

  function save() {
    let v: string | null = null;
    if (typeof p !== 'number') v = 'Enter the plan price in rupees.';
    else if (c === 'invalid') v = 'Enter a valid compare-at price or leave it empty.';
    else if (typeof c === 'number' && c <= p) v = 'Compare-at price must be higher than the price.';
    setError(v);
    if (v || typeof p !== 'number' || c === 'invalid') return;
    if (changed && !confirming) {
      setConfirming(true);
      return;
    }
    run(
      () => action({ priceRupees: p, compareAtRupees: c, isRecommended: recommended }),
      () => {
        setOpen(false);
        setConfirming(false);
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setConfirming(false);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="min-h-9" aria-label={`Edit ${plan.name}`}>
          <Pencil className="size-4" aria-hidden />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {plan.name}</DialogTitle>
          <DialogDescription asChild>
            <div>
              <DemoResetNote />
            </div>
          </DialogDescription>
        </DialogHeader>
        {confirming ? (
          <PriceConfirm
            lines={[
              `Price: ${formatINR(plan.pricePaise)} → ${pPaise === null ? '—' : formatINR(pPaise)}`,
              `Compare-at: ${plan.compareAtPaise === null ? 'none' : formatINR(plan.compareAtPaise)} → ${cPaise === null ? 'none' : formatINR(cPaise)}`,
            ]}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="pl-price" label="Price (₹, incl. GST)">
              <Input
                id="pl-price"
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
            <Field id="pl-compare" label="Compare-at (₹)" hint="Optional; must be higher than the price.">
              <Input
                id="pl-compare"
                inputMode="decimal"
                value={compare}
                onChange={(e) => setCompare(e.target.value)}
              />
            </Field>
            <div className="flex items-center justify-between gap-3 rounded-md border border-line p-3 sm:col-span-2">
              <Label htmlFor="pl-rec" className="flex-1">
                Doctor-recommended duration
                <span className="block text-[12px] font-normal text-muted-foreground">
                  Only one plan carries the badge.
                </span>
              </Label>
              <Switch id="pl-rec" checked={recommended} onCheckedChange={setRecommended} />
            </div>
          </div>
        )}
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => (confirming ? setConfirming(false) : setOpen(false))}
            disabled={pending}
          >
            {confirming ? 'Back' : 'Cancel'}
          </Button>
          <Button onClick={save} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {confirming ? 'Confirm price change' : changed ? 'Review change' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
