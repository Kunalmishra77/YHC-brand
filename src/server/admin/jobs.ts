import 'server-only';

import { AppError } from '@/lib/errors';
import { db } from '@/server/demo/store';

/*
 * Job queue monitor actions (FR-M12-6). Demo stand-ins for the SQL `claim_jobs` / `cancel_jobs`
 * paths: retry puts a failed/cancelled job back to pending now; cancel stops a pending job.
 */

export function retryJob(jobId: string): void {
  const job = db().jobs.find((j) => j.id === jobId);
  if (!job) throw new AppError('not_found', 'Job not found', 404);
  if (job.status !== 'failed' && job.status !== 'cancelled') {
    throw new AppError(
      'invalid_state',
      `Only failed or cancelled jobs can be retried (this one is ${job.status}).`,
      409,
    );
  }
  job.status = 'pending';
  job.runAt = new Date().toISOString();
  job.lastError = null;
}

export function cancelJob(jobId: string): void {
  const job = db().jobs.find((j) => j.id === jobId);
  if (!job) throw new AppError('not_found', 'Job not found', 404);
  if (job.status !== 'pending' && job.status !== 'failed') {
    throw new AppError(
      'invalid_state',
      `Only pending or failed jobs can be cancelled (this one is ${job.status}).`,
      409,
    );
  }
  job.status = 'cancelled';
}

/** Demo retry for a failed outbound message (FR-M8-3): re-queued and marked sent by the log adapter. */
export function retryMessage(messageId: string): void {
  const msg = db().messages.find((m) => m.id === messageId);
  if (!msg) throw new AppError('not_found', 'Message not found', 404);
  if (msg.status !== 'failed')
    throw new AppError('invalid_state', 'Only failed messages can be retried.', 409);
  msg.status = 'sent';
  msg.at = new Date().toISOString();
}
