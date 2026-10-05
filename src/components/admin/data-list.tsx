import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
  /** hidden in the stacked mobile card */
  hideOnMobile?: boolean;
}

/**
 * Admin DataTable (docs/07 §5): a table from `md` up, stacked label/value cards below
 * (works at 360 px). The first column is the card title; `actions` render in both layouts.
 * Wide tables scroll inside their bordered container with the first column pinned.
 */
export function DataList<T>({
  rows,
  columns,
  rowKey,
  actions,
  caption,
  empty,
}: {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  actions?: (row: T) => React.ReactNode;
  caption?: string;
  empty?: React.ReactNode;
}) {
  if (rows.length === 0 && empty) return <>{empty}</>;
  const [first, ...rest] = columns;
  const sticky =
    'sticky left-0 z-[1] bg-card shadow-[inset_-1px_0_0_var(--color-line)] group-hover/row:bg-pearl';
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-card ring-1 ring-line/80">
      <div className="hidden md:block">
        <Table>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <TableHeader>
            <TableRow className="bg-mist/60 hover:bg-mist/60">
              {columns.map((c, i) => (
                <TableHead
                  key={c.header}
                  className={cn(
                    'h-11 px-4 text-[13px] font-medium text-ink first:pl-5',
                    c.align === 'right' && 'text-right',
                    i === 0 && 'sticky left-0 z-[1] bg-mist shadow-[inset_-1px_0_0_var(--color-line)]',
                    c.className,
                  )}
                >
                  {c.header}
                </TableHead>
              ))}
              {actions ? (
                <TableHead className="h-11 px-4 pr-5 text-right text-[13px] font-medium text-ink">
                  <span className="sr-only">Actions</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row)} className="group/row hover:bg-pearl">
                {columns.map((c, i) => (
                  <TableCell
                    key={c.header}
                    className={cn(
                      'px-4 py-3.5 align-middle first:pl-5',
                      c.align === 'right' && 'text-right',
                      i === 0 && sticky,
                      c.className,
                    )}
                  >
                    {c.cell(row)}
                  </TableCell>
                ))}
                {actions ? (
                  <TableCell className="px-4 py-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-2">{actions(row)}</div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="divide-y divide-line md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={rowKey(row)} className="space-y-3 p-4">
            {first ? <div className="min-w-0 font-medium break-words text-ink">{first.cell(row)}</div> : null}
            <dl className="grid grid-cols-[minmax(6.5rem,38%)_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 text-sm">
              {rest
                .filter((c) => !c.hideOnMobile)
                .map((c) => (
                  <div key={c.header} className="contents">
                    <dt className="text-[13px] text-muted-foreground">{c.header}</dt>
                    <dd className="min-w-0 text-right break-words text-body">{c.cell(row)}</dd>
                  </div>
                ))}
            </dl>
            {actions ? (
              <div className="flex flex-wrap gap-2 pt-1 [&>*]:min-h-10 [&>*]:flex-1 [&>*]:basis-[calc(50%-0.25rem)]">
                {actions(row)}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
