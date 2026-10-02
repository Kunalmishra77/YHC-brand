import type { Metadata } from 'next';
import { CheckoutFlow } from '@/components/checkout/checkout-flow';
import { getCurrentCustomer } from '@/server/session';
import { maskPhone } from '../book/booking-views';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const customer = await getCurrentCustomer();
  return (
    <CheckoutFlow
      signedIn={
        customer
          ? {
              maskedPhone: maskPhone(customer.phone),
              name: customer.name === 'New customer' ? null : customer.name,
            }
          : null
      }
    />
  );
}
