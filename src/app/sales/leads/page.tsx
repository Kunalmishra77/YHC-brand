import { redirect } from 'next/navigation';

/** Hidden for real journey v1 (ADR-36): the sales portal is the lead list + lead page. */
export default function HiddenSalesPage() {
  redirect('/sales');
}