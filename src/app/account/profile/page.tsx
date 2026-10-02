import { MapPin } from 'lucide-react';
import { ConsentsList, type ConsentRow } from '@/components/account/consents-list';
import { DataRequestForm } from '@/components/account/data-request-form';
import { formatIstDay } from '@/components/account/format';
import { ACCOUNT_LINKS } from '@/components/account/links';
import { ProfileForm } from '@/components/account/profile-form';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/states';
import { customerAddresses, customerAppointments, customerOrders } from '@/server/account/queries';
import { getGuarantee } from '@/server/catalog';
import { getCurrentCustomer } from '@/server/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Profile' };

// TODO(client): data-request acknowledgement and resolution timelines — confirm with counsel (docs/09 §5–6, docs/12 Business).
const SLA_NOTE =
  'We acknowledge every request on WhatsApp and email, and tell you when to expect a response. Response timelines are being confirmed with our legal advisor.';

export default async function ProfilePage() {
  const customer = await getCurrentCustomer();
  if (!customer) return null;
  const addresses = customerAddresses(customer.id);
  const { past, upcoming } = customerAppointments(customer.id);
  const firstConsult = [...past].reverse()[0] ?? upcoming[0];
  const firstPlanOrder = [...customerOrders(customer.id)].reverse().find((o) => o.planId);
  const joined = formatIstDay(customer.createdAt);
  const consultOn = firstConsult ? formatIstDay(firstConsult.startsAt) : null;
  const planOn = firstPlanOrder ? formatIstDay(firstPlanOrder.createdAt) : null;
  const guarantee = getGuarantee();

  // Demo consent records (FR-M14-1). Phase 12 reads the `consents` table with policy versions.
  const rows: ConsentRow[] = [
    {
      key: 'privacy',
      title: 'Privacy policy',
      purpose: 'How we collect, store and protect your data.',
      version: 'Version 1 · draft',
      givenOn: joined,
      required: true,
    },
    {
      key: 'terms',
      title: 'Terms of use',
      purpose: 'The rules for using Your Hair Company.',
      version: 'Version 1 · draft',
      givenOn: joined,
      required: true,
    },
    {
      key: 'telemedicine',
      title: 'Telemedicine consent',
      purpose: 'Consulting a doctor by video, and the limits of a remote consultation.',
      version: 'Version 1 · draft',
      givenOn: consultOn,
      required: true,
    },
    ...(guarantee
      ? [
          {
            key: 'guarantee_terms',
            title: 'Guarantee terms',
            purpose: 'The conditions of the money-back guarantee, accepted at your first plan purchase.',
            version: `Policy v${guarantee.version}${guarantee.isDraft ? ' · draft' : ''}`,
            givenOn: planOn,
            required: true,
          },
        ]
      : []),
    {
      key: 'whatsapp_utility',
      title: 'WhatsApp updates',
      purpose: 'Booking confirmations, reminders, delivery updates and weekly check-ins.',
      version: 'Version 1',
      givenOn: joined,
      required: false,
      effect:
        'We will send booking and delivery updates by SMS and email instead, and stop weekly check-ins on WhatsApp.',
    },
    {
      key: 'whatsapp_marketing',
      title: 'Offers on WhatsApp',
      purpose: 'Occasional offers and news from Your Hair Company.',
      version: 'Version 1',
      givenOn: joined,
      required: false,
      effect: 'We will stop sending offers on WhatsApp. Care and order updates are not affected.',
    },
    {
      key: 'clinical_photo_use',
      title: 'Photos for your care',
      purpose: 'Dr. Tyagi uses your scalp and progress photos to assess and review your treatment.',
      version: 'Version 1',
      givenOn: consultOn,
      required: false,
      effect:
        'Dr. Tyagi will no longer review your photos. Your plan may be harder to adjust, and the guarantee needs monthly photos.',
    },
    {
      key: 'marketing_photo_use',
      title: 'Photos in our marketing',
      purpose: 'Using your before/after photos on our website or ads. Only with this separate permission.',
      version: 'Version 1',
      givenOn: null,
      required: false,
    },
    {
      key: 'review_publication',
      title: 'Publishing your review',
      purpose: 'Showing your review or story on our website.',
      version: 'Version 1',
      givenOn: null,
      required: false,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Your details, saved addresses, permissions and data requests."
      />

      <section aria-labelledby="p-details" className="rounded-xl border border-line bg-card p-5 md:p-6">
        <h2 id="p-details" className="mb-5 text-base font-semibold text-ink">
          Your details
        </h2>
        <ProfileForm name={customer.name} email={customer.email} phone={customer.phone} />
      </section>

      <section aria-labelledby="p-addresses" className="rounded-xl border border-line bg-card p-5 md:p-6">
        <h2 id="p-addresses" className="text-base font-semibold text-ink">
          Delivery addresses
        </h2>
        {addresses.length === 0 ? (
          <EmptyState
            className="mt-4 py-6"
            title="No saved addresses"
            body="The address from your first order is saved here."
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {addresses.map((a, i) => (
              <li key={a} className="flex items-start gap-3 rounded-lg border border-line p-4">
                <MapPin className="mt-0.5 size-4 shrink-0 text-steel" aria-hidden />
                <div>
                  <p className="text-sm text-ink">{a}</p>
                  {i === 0 ? (
                    <p className="mt-0.5 text-[13px] text-muted-foreground">Used for reorders</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[13px] text-muted-foreground">
          To change an address, message the care team before your next order ships.
        </p>
      </section>

      <section aria-labelledby="p-consents" className="rounded-xl border border-line bg-card p-5 md:p-6">
        <h2 id="p-consents" className="text-base font-semibold text-ink">
          Permissions
        </h2>
        <p className="mt-1 mb-5 text-sm text-body">What you have agreed to, and the version you agreed to.</p>
        <ConsentsList rows={rows} termsHref={ACCOUNT_LINKS.privacy} />
      </section>

      <section aria-labelledby="p-data" className="rounded-xl border border-line bg-card p-5 md:p-6">
        <h2 id="p-data" className="text-base font-semibold text-ink">
          Your data rights
        </h2>
        <p className="mt-1 mb-5 text-sm text-body">
          Ask for a copy of your data, correct it, delete it, or raise a grievance with our grievance officer.
        </p>
        <DataRequestForm slaNote={SLA_NOTE} />
      </section>
    </div>
  );
}
