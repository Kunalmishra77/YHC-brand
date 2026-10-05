/**
 * UI strings (TRD §9 i18n). Hindi is added in P2 by providing the same shape.
 * Long-form content (concerns, FAQs, product copy, legal) is CMS data, not UI strings.
 */
export const en = {
  brand: {
    name: 'Your Hair Company',
    short: 'YHC',
    tagline: 'Doctor-led hair care',
  },
  common: {
    bookConsultation: 'Book consultation',
    bookConsultationPrice: 'Book consultation · ₹500',
    freeAssessment: 'Free hair assessment',
    whatsapp: 'WhatsApp',
    continue: 'Continue',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading…',
    retry: 'Try again',
    viewAll: 'View all',
    search: 'Search',
    signOut: 'Sign out',
    perMonth: '/month',
    inclGst: 'Prices include GST',
    errorTitle: 'Something went wrong',
    errorBody: 'Please try again. If it keeps happening, message us on WhatsApp.',
    emptyTitle: 'Nothing here yet',
    demoBadge: 'Demo',
    draftTerms: 'Draft terms — pending approval',
    resultsVary: 'Individual results vary.',
  },
  nav: {
    concerns: 'Hair concerns',
    plans: 'Treatment plans',
    products: 'Products',
    doctor: 'Meet Dr. Tyagi',
    howItWorks: 'How it works',
    faqs: 'FAQs',
    science: 'Science',
    scan: '3D Scan',
    results: 'Results',
    guarantee: 'Guarantee',
    doctorShort: 'Doctor',
    beginScan: 'Begin 3D scan',
    account: 'My account',
  },
  legal: {
    disclaimer:
      'Information on this site is for general education and is not a substitute for medical advice. Treatment is prescribed only after a consultation. Individual results vary.',
    grievance: 'Grievance officer',
  },
  status: {
    appointment: {
      held: 'Held · awaiting payment',
      booked: 'Booked · paid',
      completed: 'Completed',
      no_show: 'No-show',
      cancelled: 'Cancelled',
      rescheduled: 'Rescheduled',
      expired: 'Hold expired',
    },
    order: {
      pending_payment: 'Awaiting payment',
      paid: 'Paid · to pack',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
      partially_refunded: 'Partly refunded',
      rto: 'Returned (RTO)',
    },
    leadStage: {
      new: 'New lead',
      contacted: 'Contacted',
      interested: 'Interested',
      consult_suggested: 'Consultation suggested',
      consult_link_sent: 'Consultation link sent',
      consult_booked: 'Consultation booked',
      payment_successful: '₹500 paid',
      consult_completed: 'Consultation completed',
      product_recommended: 'Plan recommended',
      product_purchased: 'Plan purchased',
      product_delivered: 'Delivered',
      followup_active: 'Follow-up active',
      reorder_due: 'Reorder due',
      reordered: 'Reordered',
      lost: 'Lost',
    },
    job: { pending: 'Pending', running: 'Running', done: 'Done', failed: 'Failed', cancelled: 'Cancelled' },
    message: {
      queued: 'Queued',
      sent: 'Sent',
      delivered: 'Delivered',
      read: 'Read',
      failed: 'Failed',
      received: 'Received',
    },
  },
} as const;

type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

export type MessageKey = Leaves<typeof en>;

/** `t('common.continue')`; `{name}` placeholders are replaced from `vars`. */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  let node: unknown = en;
  for (const part of key.split('.')) node = (node as Record<string, unknown>)[part];
  let text = typeof node === 'string' ? node : key;
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v));
  return text;
}
