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
  return (
    <div className="overflow-hidden rounded-xl bg-card shadow-card ring-1 ring-line/80">
      <div className="hidden md:block">
        <Table>
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <TableHeader>
            <TableRow className="bg-mist/60 hover:bg-mist/60">
              {columns.map((c) => (
                <TableHead
                  key={c.header}
                  className={cn(
                    'h-10 text-[13px] font-medium text-ink',
                    c.align === 'right' && 'text-right',
                    c.className,
                  )}
                >
                  {c.header}
                </TableHead>
              ))}
              {actions ? (
                <TableHead className="h-10 text-right text-[13px] font-medium text-ink">
                  <span className="sr-only">Actions</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={rowKey(row)}>
                {columns.map((c) => (
                  <TableCell
                    key={c.header}
                    className={cn('py-3 align-middle', c.align === 'right' && 'text-right', c.className)}
                  >
                    {c.cell(row)}
                  </TableCell>
                ))}
                {actions ? (
                  <TableCell className="py-3 text-right">
                    <div className="flex justify-end gap-2">{actions(row)}</div>
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ul className="divide-y divide-line md:hidden" aria-label={caption}>
        {rows.map((row) => (
          <li key={rowKey(row)} className="space-y-2 p-4">
            {first ? <div className="font-medium text-ink">{first.cell(row)}</div> : null}
            <dl className="grid grid-cols-[minmax(0,40%)_1fr] gap-x-3 gap-y-1.5 text-sm">
              {rest
                .filter((c) => !c.hideOnMobile)
                .map((c) => (
                  <div key={c.header} className="contents">
                    <dt className="text-muted-foreground">{c.header}</dt>
                    <dd className="min-w-0 break-words text-body">{c.cell(row)}</dd>
                  </div>
                ))}
            </dl>
            {actions ? <div className="flex flex-wrap gap-2 pt-1">{actions(row)}</div> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
