// TODO(client): WhatsApp business number, support email, grievance officer — see docs/12 C / D-P7
export const SITE = {
  whatsappUrl: 'https://wa.me/910000000000?text=Hi%20YHC',
  supportEmail: 'care@yourhaircompany.com',
  grievanceOfficer: { name: 'Grievance Officer', email: 'grievance@yourhaircompany.com' },
} as const;

/** Trust-led main navigation (ADR-27). Plans, products and concerns stay reachable via the footer/pages. */
export const SITE_NAV = [
  { href: '/science', key: 'nav.science' },
  { href: '/start', key: 'nav.scan' },
  { href: '/results', key: 'nav.results' },
  { href: '/guarantee', key: 'nav.guarantee' },
  { href: '/doctor-tyagi', key: 'nav.doctorShort' },
  { href: '/faqs', key: 'nav.faqs' },
] as const;

/** Titles mirror src/server/content/legal.ts. `primary` pages also sit in the footer bottom bar. */
export const LEGAL_PAGES = [
  { slug: 'privacy', title: 'Privacy Policy', primary: true },
  { slug: 'terms', title: 'Terms & Conditions', primary: true },
  { slug: 'refund-cancellation', title: 'Refund Policy', primary: true },
  { slug: 'shipping', title: 'Shipping Policy', primary: false },
  { slug: 'guarantee', title: 'Guarantee Terms', primary: false },
  { slug: 'medical-disclaimer', title: 'Medical Disclaimer', primary: false },
  { slug: 'grievance', title: 'Grievance Officer', primary: false },
] as const;
