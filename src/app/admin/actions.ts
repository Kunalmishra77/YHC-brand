'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { runAdminAction, type ActionResult } from '@/server/admin/guard';
import { resetSharedDemo } from '@/server/demo/persist';
import { recordAudit } from '@/server/demo/store';

const exportSchema = z.object({
  dataset: z.enum(['orders', 'audit', 'customers']),
  rows: z.number().int().min(0).max(100_000),
});

/** Exports are audited (FR-M14-4); the CSV itself is built in the browser. Ops may export orders only. */
export async function logExportAction(input: z.infer<typeof exportSchema>): Promise<ActionResult> {
  const roles = input.dataset === 'orders' ? (['admin', 'ops'] as const) : (['admin'] as const);
  return runAdminAction([...roles], exportSchema, input, (data, user) => {
    recordAudit(user.name, 'data.export', `${data.dataset} CSV · ${data.rows} rows`);
    revalidatePath('/admin/audit');
    return `Exported ${data.rows} rows · logged in the audit log`;
  });
}

/** Restores seed data, fixtures edited from /admin and admin-only demo state. */
export async function resetDemoAction(): Promise<ActionResult> {
  return runAdminAction(['admin'], z.undefined(), undefined, async () => {
    await resetSharedDemo();
    revalidatePath('/', 'layout');
    return 'Demo data reset to the original sample';
  });
}
