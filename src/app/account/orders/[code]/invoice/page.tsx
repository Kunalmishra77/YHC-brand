import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatWhen } from '@/components/account/format';
import { PrintButton } from '@/components/account/print-button';
import { t } from '@/i18n/en';
import { formatINR } from '@/lib/money';
import { invoiceFor, findCustomerOrder } from '@/server/account/queries';
import { getCurrentCustomer } from '@/server/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Invoice' };

/*
 * HTML invoice placeholder (FR-M4-4).
 * TODO(phase-09): GST invoice PDF from the `invoice.generate` job (CGST/SGST vs IGST by place of supply).
 * TODO(client): legal entity name, registered address, GSTIN, HSN/GST rates per product — see docs/12 Business, D-P2.
 */
export default async function InvoicePage({ params }: PageProps<'/account/orders/[code]/invoice'>) {
  const { code } = await params;
  const customer = await getCurrentCustomer();
  if (!customer) notFound();
  const order = findCustomerOrder(customer.id, code);
  if (!order?.paidAt) notFound();
  const invoice = invoiceFor(order);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/account/orders/${order.code}`}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Order {order.code}
        </Link>
        <PrintButton />
      </div>

      <article className="mt-4 rounded-xl border border-line bg-white p-5 shadow-card md:p-10 print:mt-0 print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="flex flex-col gap-4 border-b-2 border-obsidian pb-5 sm:flex-row sm:justify-between">
          <div>
            <p className="font-display text-[28px] leading-none font-medium text-ink">{t('brand.name')}</p>
            <p className="mt-2 text-[13px] text-body">Legal entity and registered address — pending</p>
            <p className="text-[13px] text-body">GSTIN: pending</p>
          </div>
          <div className="text-sm sm:text-right">
            <p className="text-[13px] font-semibold tracking-[0.12em] text-brand uppercase">Tax invoice</p>
            <p className="price mt-1 text-ink">{invoice.invoiceNo}</p>
            <p className="text-body">Date {formatWhen(invoice.issuedAt, 'd MMM yyyy')}</p>
            <p className="text-body">Order {order.code}</p>
          </div>
        </header>

        <p className="mt-4 rounded-md bg-warning-bg p-3 text-[13px] text-warning print:border print:border-line">
          Demo placeholder — not a valid tax invoice. GSTIN, HSN codes and tax split are confirmed with the CA
          before launch.
        </p>

        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Billed to</dt>
            <dd className="font-medium text-ink">{customer.name}</dd>
            <dd className="text-body">{customer.phone}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Ship to</dt>
            <dd className="text-body">{order.address}</dd>
          </div>
        </dl>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[13px] text-muted-foreground">
                <th scope="col" className="py-2 pr-3 font-medium">
                  Item
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  HSN
                </th>
                <th scope="col" className="py-2 pr-3 font-medium">
                  GST
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-medium">
                  Qty
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.lines.map((line) => (
                <tr key={line.label} className="border-b border-line align-top">
                  <td className="py-3 pr-3">
                    <p className="font-medium text-ink">{line.label}</p>
                    {line.includes.length ? (
                      <ul className="mt-1 space-y-0.5 text-[13px] text-muted-foreground">
                        {line.includes.map((p) => (
                          <li key={p.name}>
                            Includes {p.name} · HSN {p.hsn} · GST {p.gstRate}%
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </td>
                  <td className="price py-3 pr-3 text-body">
                    {line.hsn ?? (line.includes.length ? 'Itemised' : '—')}
                  </td>
                  <td className="py-3 pr-3 text-body">{line.gstRate !== null ? `${line.gstRate}%` : '—'}</td>
                  <td className="price py-3 pr-3 text-right text-body">{line.qty}</td>
                  <td className="price py-3 text-right text-ink">{formatINR(line.amountPaise)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="text-sm">
              <tr>
                <td colSpan={4} className="pt-3 pr-3 text-right text-body">
                  Subtotal
                </td>
                <td className="price pt-3 text-right text-ink">{formatINR(order.subtotalPaise)}</td>
              </tr>
              {order.creditPaise > 0 ? (
                <tr>
                  <td colSpan={4} className="pt-1 pr-3 text-right text-body">
                    Consultation fee credit
                  </td>
                  <td className="price pt-1 text-right text-ink">− {formatINR(order.creditPaise)}</td>
                </tr>
              ) : null}
              <tr>
                <td colSpan={4} className="pt-2 pr-3 text-right font-semibold text-ink">
                  Total paid
                </td>
                <td className="price pt-2 text-right text-ink">{formatINR(order.totalPaise)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <footer className="mt-8 border-t border-line pt-4 text-[13px] text-muted-foreground">
          <p>
            {t('common.inclGst')}. Paid online{order.paymentId ? ` · ref ${order.paymentId}` : ''}.
          </p>
          <p className="mt-1">This is a computer-generated invoice.</p>
        </footer>
      </article>
    </div>
  );
}
