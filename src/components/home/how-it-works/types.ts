/** Serialisable step data passed from the server section to the client stepper (no functions/icons). */
export type StepVisualId = 'details' | 'scan' | 'assessment' | 'health' | 'slot' | 'consult' | 'followup';

export interface StepImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** True once the client's generated photo is in (slot ready); until then the UI mock stays in front. */
  ready: boolean;
  /** "Illustrative image" chip text, when the photo needs one. */
  note?: string;
}

export interface HowStep {
  id: StepVisualId;
  title: string;
  body: string;
  /** Short supporting line under the body (fee, "free", who decides). */
  meta?: string;
  /** Happens after the consultation (follow-up) — labelled "After" so the journey reads as 6 + 1. */
  after?: boolean;
  /** The step's photo (slots H06–H12). */
  image: StepImage;
}

export interface SlotTerms {
  fee: string;
  slotMinutes: number;
}
