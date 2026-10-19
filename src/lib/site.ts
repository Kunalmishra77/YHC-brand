// TODO(client): WhatsApp business number (env NEXT_PUBLIC_WHATSAPP_NUMBER), support hours, grievance
// officer — see docs/18 (audit FUN-01, CON-05, SEC-05).
const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '');

export const SITE = {
  /** True once the real WhatsApp Business number is configured; until then WhatsApp buttons are hidden. */
  whatsappAvailable: whatsappNumber.length >= 10,
  /** wa.me link, or the contact page while no number is configured (never a dead placeholder number). */
  whatsappUrl: whatsappNumber.length >= 10 ? `https://wa.me/${whatsappNumber}?text=Hi%20YHC` : '/contact',
  supportEmail: 'care@yourhaircompany.com',
  /** Support / consultation hours, e.g. 'Mon–Sat, 10 am – 7 pm IST'; null hides every hours line. */
  supportHours: null as string | null,
  grievanceOfficer: { name: 'Grievance Officer', email: 'grievance@yourhaircompany.com' },
} as const;

/** Trust-led main navigation (ADR-27). Plans are listed for price transparency (audit UX-10). */
export const SITE_NAV = [
  { href: '/science', key: 'nav.science' },
  { href: '/start', key: 'nav.scan' },
  { href: '/results', key: 'nav.results' },
  { href: '/plans', key: 'nav.plansShort' },
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
