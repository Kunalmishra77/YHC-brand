import 'server-only';

import { differenceInCalendarDays } from 'date-fns';
import type { ProgressPhotoSet } from '@/lib/domain/types';
import { istDate } from '@/lib/time';
import { db } from '@/server/demo/store';
import { activePlan } from './queries';

/*
 * FR-M4-5: monthly progress photo set (front hairline, crown, parting). Demo: records the set only —
 * no files are stored. Phase 04/09: private Supabase Storage bucket + signed upload URLs.
 */

export const PHOTO_ANGLES = [
  { id: 'front', label: 'Front hairline', hint: 'Face the camera, hair pushed back, eyes level.' },
  { id: 'crown', label: 'Crown', hint: 'Top of the head from above — ask someone to help.' },
  { id: 'parting', label: 'Parting', hint: 'Centre parting, camera straight above.' },
] as const;

export type PhotoAngle = (typeof PHOTO_ANGLES)[number]['id'];

export function addProgressPhotoSet(customerId: string, now = new Date()): ProgressPhotoSet {
  const s = db();
  const today = istDate(now);
  const plan = activePlan(customerId, now);
  let label = 'Progress photos';
  if (plan) {
    const offset = differenceInCalendarDays(
      new Date(`${today}T00:00:00Z`),
      new Date(`${plan.deliveredOn}T00:00:00Z`),
    );
    const month = offset <= 30 ? 1 : Math.ceil(offset / 30);
    label = `Month ${month}`;
  }
  s.seq += 1;
  const set: ProgressPhotoSet = { id: `ph-${s.seq}`, customerId, takenOn: today, label };
  s.photos.push(set);
  // TODO(phase-04): emit('progress_photos.uploaded') so the doctor queue and check-in flow react.
  return set;
}
