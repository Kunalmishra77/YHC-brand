/** Serialisable view models passed from server pages to the booking client components. */

export interface SlotView {
  /** UTC ISO */
  startsAt: string;
  /** "11:20 am" (IST) */
  time: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
}

export interface SlotDayView {
  /** IST YYYY-MM-DD */
  date: string;
  /** "Today" / "Tomorrow" / "Thu 16 Oct" */
  tab: string;
  /** "Thursday 16 October" */
  long: string;
  remaining: number;
  slots: SlotView[];
}

export interface HoldView {
  appointmentId: string;
  code: string;
  startsAt: string;
  /** "Tue 14 Oct, 11:20 am IST" */
  when: string;
  feePaise: number;
  /** seconds left on the hold when the server answered */
  holdSecondsLeft: number;
}

export interface SignedInView {
  customerId: string;
  name: string | null;
  age: number | null;
  /** "+91 ••••• 43210" */
  maskedPhone: string;
}

export interface ConfirmedView {
  appointmentId: string;
  code: string;
  when: string;
  startsAt: string;
  endsAt: string;
  feePaise: number;
  paymentId: string | null;
  paidAt: string;
}
