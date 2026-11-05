import { redirect } from 'next/navigation';

/** Hidden for real journey v1 (ADR-36): returns with orders and the doctor flow. */
export default function HiddenAccountPage() {
  redirect('/account');
}