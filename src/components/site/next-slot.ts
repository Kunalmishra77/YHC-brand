import 'server-only';

import { formatIst, istDate } from '@/lib/time';
import { getSlots } from '@/server/demo/store';

/** "Today, 2:40 pm" style label for the earliest bookable slot, from the live availability engine. */
export function getNextSlotLabel(now = new Date()): { label: string; remainingToday: number } | null {
  const days = getSlots(now);
  const first = days.find((d) => d.slots.length > 0);
  const slot = first?.slots[0];
  if (!first || !slot) return null;
  const today = istDate(now);
  const tomorrow = istDate(new Date(now.getTime() + 86_400_000));
  const day =
    first.date === today
      ? 'Today'
      : first.date === tomorrow
        ? 'Tomorrow'
        : formatIst(slot.startsAt, 'EEE d MMM');
  return {
    label: `${day}, ${formatIst(slot.startsAt, 'h:mm aaa')}`,
    remainingToday: first.date === today ? first.remaining : 0,
  };
}
