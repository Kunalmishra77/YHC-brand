import 'server-only';

import type { Customer, LeadSource } from '@/lib/domain/types';
import { AppError } from '@/lib/errors';
import { db, findOrCreateCustomer } from './store';

/*
 * DEMO ONLY (ADR-33, audit SEC-02). The demo OTP is a fixed code shown on screen, so it proves
 * nothing about who owns a number. To stop one visitor opening another person's record by typing
 * their mobile number, a demo OTP sign-in reaches an EXISTING customer only from the browser that
 * already holds that customer's signed session. Real phone OTP (kit Phase 03) removes this rule.
 */
export function claimCustomerByDemoOtp(input: {
  phone: string;
  name?: string;
  age?: number;
  source?: LeadSource;
  /** Customer id of the current verified session, if any. */
  sessionCustomerId: string | null;
}): Customer {
  const existing = db().customers.find((c) => c.phone === input.phone);
  if (existing && existing.id !== input.sessionCustomerId) {
    throw new AppError(
      'demo_number_in_use',
      'This number is already registered in the demo. Please continue on the device you started on, or use another number to try the demo.',
      409,
    );
  }
  return findOrCreateCustomer({ phone: input.phone, name: input.name, age: input.age, source: input.source });
}
