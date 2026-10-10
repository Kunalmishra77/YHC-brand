/** Serialisable step data passed from the server section to the client stepper (no functions/icons). */
export type StepVisualId = 'details' | 'scan' | 'assessment' | 'health' | 'slot' | 'consult' | 'followup';

export interface HowStep {
  id: StepVisualId;
  title: string;
  body: string;
  /** Short supporting line under the body (fee, "free", who decides). */
  meta?: string;
}

export interface SlotTerms {
  fee: string;
  slotMinutes: number;
}
