'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { AppError } from '@/lib/errors';
import { runAdminAction, type ActionResult } from '@/server/admin/guard';
import { settingKind, validateSettingValue } from '@/server/admin/settings';
import { db, updateSetting } from '@/server/demo/store';

const schema = z.object({ key: z.string().min(1).max(80), value: z.string().max(2000) });

/** FR-M12-9: validated against the current value's type, audited by `updateSetting`. */
export async function updateSettingAction(input: z.infer<typeof schema>): Promise<ActionResult> {
  return runAdminAction(['admin'], schema, input, (data, user) => {
    const current = db().settings.find((x) => x.key === data.key);
    if (!current) throw new AppError('not_found', 'Unknown setting', 404);
    const normalized = validateSettingValue(data.key, settingKind(current), data.value);
    if (normalized === current.value) return 'No change';
    updateSetting(data.key, normalized, user.name);
    revalidatePath('/', 'layout');
    return `${data.key} saved · audited`;
  });
}
