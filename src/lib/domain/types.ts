/**
 * Domain types shared by UI and server. Mirror the SQL enums in
 * supabase/migrations/20261002000001_init_schema.sql — keep in sync until `pnpm db:types` replaces them.
 */
import type { Paise } from '@/lib/money';

export type AppRole = 'customer' | 'doctor' | 'sales' | 'ops' | 'admin';

export const LEAD_STAGES = [
  'new',
  'contacted',
  'interested',
  'consult_suggested',
  'consult_link_sent',
  'consult_booked',
  'payment_successful',
  'consult_completed',
  'product_recommended',
  'product_purchased',
  'product_delivered',
  'followup_active',
  'reorder_due',
  'reordered',
  'lost',
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

/** FR-M7-3: only these are set by people. */
export const MANUAL_LEAD_STAGES = [
  'new',
  'contacted',
  'interested',
  'consult_suggested',
  'consult_link_sent',
  'lost',
] as const satisfies readonly LeadStage[];

export type LeadSource = 'meta_ads' | 'whatsapp' | 'website' | 'sales' | 'referral' | 'google';

export type AppointmentStatus =
  'held' | 'booked' | 'completed' | 'no_show' | 'cancelled' | 'rescheduled' | 'expired';
export type AppointmentKind = 'first' | 'follow_up';
export type RecommendationStatus = 'draft' | 'sent' | 'paid' | 'expired' | 'declined' | 'cancelled';
export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'
  | 'rto';
export type OrderSource = 'shop' | 'recommendation' | 'reorder' | 'subscription' | 'manual';
export type PaymentStatus =
  'created' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'partially_refunded';
export type MessageChannel = 'whatsapp' | 'sms' | 'email';
export type MessageCategory = 'marketing' | 'utility' | 'authentication' | 'service';
export type MessageStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'received';
export type JobStatus = 'pending' | 'running' | 'done' | 'failed' | 'cancelled';
export type TaskStatus = 'open' | 'done' | 'cancelled';
export type RegulatoryCategory = 'cosmetic' | 'ayurvedic' | 'drug' | 'supplement' | 'other';
export type GuaranteeClaimStatus =
  'submitted' | 'under_review' | 'approved' | 'rejected' | 'refunded' | 'withdrawn';
export type HairConcern =
  'hair_fall' | 'thinning' | 'receding_hairline' | 'crown_thinning' | 'dandruff_scalp' | 'other';

export interface Doctor {
  id: string;
  name: string;
  qualifications: string;
  registrationNo: string;
  council: string;
  bio: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  ingredients: { name: string; role: string }[];
  howToUse: string;
  whatToExpect: string;
  regulatoryCategory: RegulatoryCategory;
  requiresConsultation: boolean;
  pricePaise: Paise | null;
  daysOfSupply: number;
  hsn: string;
  gstRate: number;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  months: 1 | 2 | 3;
  pricePaise: Paise;
  compareAtPaise: Paise | null;
  isRecommended: boolean;
  description: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string; // E.164
  email: string | null;
  age: number;
  gender: 'male' | 'female' | 'other';
  city: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  code: string; // YHC-A-1001
  customerId: string;
  doctorId: string;
  kind: AppointmentKind;
  status: AppointmentStatus;
  startsAt: string; // UTC ISO
  endsAt: string;
  holdExpiresAt: string | null;
  feePaise: Paise;
  concern: HairConcern;
  intakeDone: boolean;
  photosDone: boolean;
  paymentId: string | null;
  joinUrl: string;
}

export interface IntakeForm {
  appointmentId: string;
  duration: string;
  pattern: string;
  previousTreatments: string;
  currentProducts: string;
  medicalHistory: string;
  medications: string;
  allergies: string;
  familyHistory: string;
}

export interface ConsultationNotes {
  appointmentId: string;
  chiefComplaint: string;
  observations: string;
  assessment: string;
  treatmentPlan: string;
  followUpInstructions: string;
  privateNotes: string;
  identityVerified: boolean;
  consentRecorded: boolean;
  status: 'draft' | 'completed';
  followUpInWeeks: number | null;
}

export interface PrescriptionItem {
  genericName: string;
  strength: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Recommendation {
  id: string;
  token: string;
  appointmentId: string;
  customerId: string;
  status: RecommendationStatus;
  planId: string;
  productIds: string[];
  note: string;
  items: PrescriptionItem[];
  createdAt: string;
  expiresAt: string;
}

export interface OrderLine {
  label: string;
  qty: number;
  amountPaise: Paise;
}

export interface Order {
  id: string;
  code: string; // YHC-10001
  customerId: string;
  source: OrderSource;
  status: OrderStatus;
  planId: string | null;
  recommendationId: string | null;
  lines: OrderLine[];
  subtotalPaise: Paise;
  creditPaise: Paise;
  totalPaise: Paise;
  paymentId: string | null;
  createdAt: string;
  paidAt: string | null;
  deliveredOn: string | null; // IST date
  planEndOn: string | null; // IST date
  courier: string | null;
  awb: string | null;
  address: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  customerId: string | null;
  source: LeadSource;
  campaign: string | null;
  stage: LeadStage;
  ownerId: string | null;
  lostReason: string | null;
  nextAction: string | null;
  nextActionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ActivityKind =
  'call' | 'whatsapp' | 'note' | 'stage_change' | 'payment' | 'appointment' | 'order' | 'message';

export interface Activity {
  id: string;
  leadId: string;
  kind: ActivityKind;
  summary: string;
  actor: string;
  at: string;
}

export interface Task {
  id: string;
  leadId: string;
  title: string;
  kind:
    | 'first_contact'
    | 'abandoned_hold'
    | 'unpaid_plan'
    | 'refill_call'
    | 'intake_missing'
    | 'side_effect'
    | 'manual';
  urgent: boolean;
  status: TaskStatus;
  ownerId: string | null;
  dueAt: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  active: boolean;
}

export interface Message {
  id: string;
  customerId: string | null;
  leadId: string | null;
  channel: MessageChannel;
  direction: 'outbound' | 'inbound';
  template: string | null;
  category: MessageCategory;
  preview: string;
  status: MessageStatus;
  at: string;
}

export interface CareCheckin {
  id: string;
  customerId: string;
  orderId: string;
  week: number;
  sentAt: string;
  reply: 'going_well' | 'have_questions' | 'side_effect' | null;
  replyText: string | null;
}

export interface ProgressPhotoSet {
  id: string;
  customerId: string;
  takenOn: string; // IST date
  label: string;
}

export interface GuaranteePolicy {
  version: number;
  name: string;
  refundPercent: number;
  minPlanMonths: number;
  claimWindowDays: number;
  minCheckinResponsePct: number;
  requireMonthlyPhotos: boolean;
  requireFollowupConsult: boolean;
  termsMd: string;
  isActive: boolean;
  isDraft: boolean;
}

export interface GuaranteeClaim {
  id: string;
  code: string;
  customerId: string;
  status: GuaranteeClaimStatus;
  statement: string;
  submittedAt: string;
  decisionNotes: string | null;
  refundPaise: Paise;
}

export interface MessageTemplate {
  key: string;
  channel: MessageChannel;
  category: MessageCategory;
  bodyPreview: string;
  approval: 'approved' | 'pending' | 'draft';
}

export interface Job {
  id: string;
  kind: string;
  status: JobStatus;
  runAt: string;
  attempts: number;
  dedupeKey: string;
  lastError: string | null;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export interface Setting {
  key: string;
  value: string;
  description: string;
}

export interface DomainEvent {
  id: number;
  type: string;
  aggregateId: string;
  at: string;
}

export interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface Concern {
  slug: HairConcern;
  title: string;
  summary: string;
  body: string;
}
