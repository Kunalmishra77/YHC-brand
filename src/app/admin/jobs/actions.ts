'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { runAdminAction, type ActionResult } from '@/server/admin/guard';
import { cancelJob, retryJob } from '@/server/admin/jobs';
import { db } from '@/server/demo/store';

const idSchema = z.string().min(1).max(64);

const kindOf = (id: string) => db().jobs.find((j) => j.id === id)?.kind ?? 'Job';

export async function retryJobAction(jobId: string): Promise<ActionResult> {
  return runAdminAction(['admin'], idSchema, jobId, (id) => {
    retryJob(id);
    revalidatePath('/admin', 'layout');
    return `${kindOf(id)} queued to run now`;
  });
}

export async function cancelJobAction(jobId: string): Promise<ActionResult> {
  return runAdminAction(['admin'], idSchema, jobId, (id) => {
    cancelJob(id);
    revalidatePath('/admin', 'layout');
    return `${kindOf(id)} cancelled`;
  });
}
