// TODO(client): WhatsApp business number, support email, grievance officer — see docs/12 C / D-P7
export const SITE = {
  whatsappUrl: 'https://wa.me/910000000000?text=Hi%20YHC',
  supportEmail: 'care@yourhaircompany.com',
  grievanceOfficer: { name: 'Grievance Officer (name pending)', email: 'grievance@yourhaircompany.com' },
} as const;

export const SITE_NAV = [
  { href: '/concerns', key: 'nav.concerns' },
  { href: '/plans', key: 'nav.plans' },
  { href: '/products', key: 'nav.products' },
  { href: '/doctor-tyagi', key: 'nav.doctor' },
  { href: '/how-it-works', key: 'nav.howItWorks' },
  { href: '/faqs', key: 'nav.faqs' },
] as const;

export const LEGAL_PAGES = [
  { slug: 'privacy', title: 'Privacy policy' },
  { slug: 'terms', title: 'Terms of use' },
  { slug: 'refund-cancellation', title: 'Refund & cancellation' },
  { slug: 'shipping', title: 'Shipping policy' },
  { slug: 'guarantee', title: 'Guarantee terms' },
  { slug: 'medical-disclaimer', title: 'Medical disclaimer' },
  { slug: 'grievance', title: 'Grievance officer' },
] as const;
