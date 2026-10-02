import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

/** Store UTC; compute business dates and display in IST. */
export const IST = 'Asia/Kolkata';

/** A Date whose wall-clock fields read as IST (for date-fns calculations only). */
export function toIST(date: Date): Date {
  return toZonedTime(date, IST);
}

/** Business date in IST as `YYYY-MM-DD`. */
export function istDate(date: Date): string {
  return formatInTimeZone(date, IST, 'yyyy-MM-dd');
}

/** The UTC instant of 00:00 IST on the IST day containing `date`. */
export function startOfIstDay(date: Date): Date {
  return fromZonedTime(`${istDate(date)}T00:00:00`, IST);
}

/** `formatIst(d)` → `Tue 14 Oct, 11:20 am IST`. */
export function formatIst(date: Date, pattern = "EEE d MMM, h:mm aaa 'IST'"): string {
  return formatInTimeZone(date, IST, pattern);
}
