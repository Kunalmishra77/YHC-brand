import { describe, expect, it } from 'vitest';
import { advanceStage, canSetManually, stageForEvent } from './stage-map';

describe('stage map', () => {
  it('maps events to stages (TRD §6.3)', () => {
    expect(stageForEvent({ type: 'payment.consultation.captured' })).toBe('payment_successful');
    expect(stageForEvent({ type: 'order.paid', source: 'recommendation' })).toBe('product_purchased');
    expect(stageForEvent({ type: 'order.paid', source: 'reorder' })).toBe('followup_active');
  });

  it('only moves forward', () => {
    expect(advanceStage('payment_successful', 'consult_booked')).toBe('payment_successful');
    expect(advanceStage('consult_booked', 'payment_successful')).toBe('payment_successful');
  });

  it('lets the retention loop cycle', () => {
    expect(advanceStage('reordered', 'followup_active')).toBe('followup_active');
    expect(advanceStage('followup_active', 'reorder_due')).toBe('reorder_due');
  });

  it('re-opens a lost lead on a system event', () => {
    expect(advanceStage('lost', 'payment_successful')).toBe('payment_successful');
  });

  it('blocks manual moves into system stages or out of them', () => {
    expect(canSetManually('new', 'contacted')).toBe(true);
    expect(canSetManually('interested', 'lost')).toBe(true);
    expect(canSetManually('new', 'payment_successful')).toBe(false);
    expect(canSetManually('payment_successful', 'contacted')).toBe(false);
  });
});
