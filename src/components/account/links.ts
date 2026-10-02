/*
 * Cross-surface links used by /account. Other surfaces own these routes — keep them in one place.
 */
export const ACCOUNT_LINKS = {
  intake: (appointmentId: string) => `/book/intake/${appointmentId}`,
  join: (appointmentId: string) => `/consult/${appointmentId}`,
  book: '/book',
  bookFollowUp: '/book?kind=follow_up',
  photos: '/account/progress#upload',
  order: (code: string) => `/account/orders/${code}`,
  guaranteeTerms: '/legal/guarantee',
  privacy: '/legal/privacy',
  grievance: '/legal/grievance',
} as const;
