import 'server-only';

import { redirect } from 'next/navigation';
import type { Customer } from '@/lib/domain/types';
import { getCurrentCustomer } from '@/server/session';
import { getJourneyForCustomer, type Journey } from './store';

type GuardedStep = 'scan' | 'assessment' | 'health_form' | 'book';

/**
 * Page guard for /start/*: each step needs the previous ones. Missing steps redirect back to the
 * first incomplete one, so deep links never show an empty or out-of-order page.
 */
export async function requireJourneyStep(
  step: GuardedStep,
): Promise<{ customer: Customer; journey: Journey }> {
  const customer = await getCurrentCustomer();
  const journey = customer ? getJourneyForCustomer(customer.id) : null;
  if (!customer || !journey) redirect('/start');
  if (step === 'scan') return { customer, journey };
  if (!journey.scan) redirect('/start/scan');
  if (step === 'assessment' || step === 'health_form') return { customer, journey };
  if (!journey.details) redirect('/start/details');
  return { customer, journey };
}
