import { format } from 'date-fns';
import { formatIst } from '@/lib/time';

/** `Mon 28 Dec 2026` for an IST business date (`YYYY-MM-DD`). */
export function formatDay(ymd: string, pattern = 'EEE d MMM yyyy'): string {
  return format(new Date(`${ymd}T12:00:00Z`), pattern);
}

/** `Tue 14 Oct, 11:20 am IST` for a UTC instant. */
export function formatWhen(iso: string, pattern?: string): string {
  return formatIst(new Date(iso), pattern);
}

/** `14 Oct 2026` in IST for a UTC instant. */
export function formatIstDay(iso: string): string {
  return formatIst(new Date(iso), 'd MMM yyyy');
}
