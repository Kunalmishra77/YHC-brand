import { redirect } from 'next/navigation';

export const metadata = { title: 'Your result', robots: { index: false } };

/** Hidden step (ADR-36): the health form, booking and consultation return with the doctor flow. */
export default function HiddenStepPage() {
  redirect('/start/result');
}
